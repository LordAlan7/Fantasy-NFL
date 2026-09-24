<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit();
}

// Conexión compartida: evita repetir usuario y contraseña en cada endpoint.
require_once __DIR__ . '/config.php';

$data = json_decode(file_get_contents("php://input"));
$user_id = isset($data->user_id) ? (int)$data->user_id : 0;

if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Falta el user_id"]);
    exit();
}

// Probabilidades del sobre. Si las cambias aquí, actualiza también
// RARITY_CONFIG en src/app/models/player.model.ts para que la app
// le muestre al usuario los mismos porcentajes.
$rand = rand(1, 100);
if ($rand <= 5) {
    $rarity = 'Legendaria';   //  5%
} elseif ($rand <= 15) {
    $rarity = 'Épica';        // 10%
} elseif ($rand <= 40) {
    $rarity = 'Rara';         // 25%
} else {
    $rarity = 'Común';        // 60%
}

$stmt = $pdo->prepare("SELECT * FROM players WHERE rareza = :rarity AND estado = 'activo' ORDER BY RAND() LIMIT 1");
$stmt->execute(['rarity' => $rarity]);
$player = $stmt->fetch();

// Si esa rareza no tiene jugadores cargados, no dejamos al usuario sin carta.
if (!$player) {
    $stmt = $pdo->prepare("SELECT * FROM players WHERE estado = 'activo' ORDER BY RAND() LIMIT 1");
    $stmt->execute();
    $player = $stmt->fetch();
}

if (!$player) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "No hay jugadores disponibles"]);
    exit();
}

// Registrar el sobre y guardar la carta van juntos: si algo falla a medias,
// no queremos un sobre contabilizado sin su carta.
try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("INSERT INTO sobres_abiertos (user_id) VALUES (:user_id)");
    $stmt->execute(['user_id' => $user_id]);

    $stmt = $pdo->prepare("SELECT id, cantidad FROM mi_coleccion WHERE user_id = :user_id AND player_id = :player_id");
    $stmt->execute(['user_id' => $user_id, 'player_id' => $player['id']]);
    $existente = $stmt->fetch();

    if ($existente) {
        $es_nueva = false;
        $cantidad = (int)$existente['cantidad'] + 1;
        $stmt = $pdo->prepare("UPDATE mi_coleccion SET cantidad = cantidad + 1 WHERE id = :id");
        $stmt->execute(['id' => $existente['id']]);
    } else {
        $es_nueva = true;
        $cantidad = 1;
        $stmt = $pdo->prepare("INSERT INTO mi_coleccion (user_id, player_id) VALUES (:user_id, :player_id)");
        $stmt->execute(['user_id' => $user_id, 'player_id' => $player['id']]);
    }

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "No se pudo guardar la carta"]);
    exit();
}

// Total de cartas del usuario, para que la app no tenga que pedirlo aparte.
$stmt = $pdo->prepare("SELECT COALESCE(SUM(cantidad), 0) AS total FROM mi_coleccion WHERE user_id = :user_id");
$stmt->execute(['user_id' => $user_id]);
$total = (int)$stmt->fetch()['total'];

echo json_encode([
    "success"  => true,
    "player"   => $player,
    "es_nueva" => $es_nueva,   // false = ya tenías esta carta
    "cantidad" => $cantidad,   // cuántas copias tienes ahora
    "total"    => $total
]);
