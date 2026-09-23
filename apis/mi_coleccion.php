<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host   = 'localhost';
$dbname = 'login_db';
$user   = 'root';
$pass   = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB connection error"]);
    exit();
}

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

echo json_encode([
    "success"   => true,
    "total"     => (int)$row['total'],
    "coleccion" => $coleccion
]);
?>
