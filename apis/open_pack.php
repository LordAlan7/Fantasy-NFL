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

$host = 'localhost';
$dbname = 'login_db';
$user = 'root'; 
$pass = '';     

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));
if (!isset($data->user_id)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing user_id"]);
    exit();
}

$user_id = $data->user_id;

$rand = rand(1, 100);
$rarity = 'Común';
if ($rand <= 5) {
    $rarity = 'Legendaria';
} elseif ($rand <= 15) {
    $rarity = 'Épica';
} elseif ($rand <= 40) {
    $rarity = 'Rara';
} else {
    $rarity = 'Común';
}

$stmt = $pdo->prepare("SELECT * FROM players WHERE rareza = :rarity AND estado = 'activo' ORDER BY RAND() LIMIT 1");
$stmt->execute(['rarity' => $rarity]);
$player = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$player) {
    $stmt = $pdo->prepare("SELECT * FROM players WHERE estado = 'activo' ORDER BY RAND() LIMIT 1");
    $stmt->execute();
    $player = $stmt->fetch(PDO::FETCH_ASSOC);
}

if ($player) {
    $stmt = $pdo->prepare("INSERT INTO sobres_abiertos (user_id) VALUES (:user_id)");
    $stmt->execute(['user_id' => $user_id]);

    $stmt = $pdo->prepare("SELECT * FROM mi_coleccion WHERE user_id = :user_id AND player_id = :player_id");
    $stmt->execute(['user_id' => $user_id, 'player_id' => $player['id']]);
    $exists = $stmt->fetch();

    if ($exists) {
        $stmt = $pdo->prepare("UPDATE mi_coleccion SET cantidad = cantidad + 1 WHERE id = :id");
        $stmt->execute(['id' => $exists['id']]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO mi_coleccion (user_id, player_id) VALUES (:user_id, :player_id)");
        $stmt->execute(['user_id' => $user_id, 'player_id' => $player['id']]);
    }
    
    echo json_encode(["success" => true, "player" => $player]);
} else {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "No players available"]);
}
?>
