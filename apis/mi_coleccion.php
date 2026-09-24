<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Conexion compartida: evita repetir usuario y contrasena en cada endpoint.
require_once __DIR__ . '/config.php';

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
if (!$user_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing user_id"]);
    exit();
}

// Total cards the user owns (sum of cantidad)
$stmt = $pdo->prepare("SELECT COALESCE(SUM(cantidad), 0) as total FROM mi_coleccion WHERE user_id = :user_id");
$stmt->execute(['user_id' => $user_id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

// Full collection with player info
$stmt2 = $pdo->prepare("
    SELECT p.id, p.player_name, p.team, p.position, p.rareza, p.puntos_semana, mc.cantidad
    FROM mi_coleccion mc
    JOIN players p ON mc.player_id = p.id
    WHERE mc.user_id = :user_id
    ORDER BY mc.created_at DESC
");
$stmt2->execute(['user_id' => $user_id]);
$coleccion = $stmt2->fetchAll(PDO::FETCH_ASSOC);

// Cuantos jugadores hay en juego, en total y por rareza, para que la app
// pueda mostrar un progreso real ("tienes 3 de 7 epicas") en vez de estimarlo.
$stmt3 = $pdo->query("SELECT rareza, COUNT(*) AS n FROM players WHERE estado = 'activo' GROUP BY rareza");
$jugadores_por_rareza = [];
$total_jugadores = 0;
foreach ($stmt3->fetchAll() as $fila) {
    $jugadores_por_rareza[$fila['rareza']] = (int)$fila['n'];
    $total_jugadores += (int)$fila['n'];
}

echo json_encode([
    "success"         => true,
    "total"           => (int)$row['total'],   // cartas contando repetidas
    "total_jugadores" => $total_jugadores,     // jugadores distintos que existen
    "por_rareza"      => $jugadores_por_rareza, // cuantos hay de cada rareza
    "coleccion"       => $coleccion
]);
?>
