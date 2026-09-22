<?php
// config.php
// Configuración de conexión a la base de datos login_db

$DB_HOST = 'localhost';
$DB_NAME = 'login_db';
$DB_USER = 'root';   // Cambia por tu usuario de MySQL/MariaDB
$DB_PASS = '';       // Cambia por tu contraseña de MySQL/MariaDB
$DB_CHARSET = 'utf8mb4';

$dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=$DB_CHARSET";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión a la base de datos',
        'error'   => $e->getMessage()
    ]);
    exit;
}
