<?php
// Cabeceras para permitir CORS (que Angular pueda hacer peticiones) y responder en JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Si es una petición OPTIONS (pre-flight), la detenemos aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo permitimos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit();
}

// Configuración de base de datos de XAMPP
 $host = 'localhost';
 $dbname = 'login_db';
 $user = 'root'; // Usuario por defecto de XAMPP
 $pass = '';     // Contraseña por defecto de XAMPP (vacía)

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos"]);
    exit();
}

// Obtener los datos del cuerpo de la petición (Angular envía JSON)
 $data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit();
}

 $email = $data->email;
 $password = $data->password;

// Buscar el usuario por email
 $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
 $stmt->execute(['email' => $email]);
 $user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    // Verificar la contraseña hasheada
    if (password_verify($password, $user['password'])) {
        http_response_code(200);
        echo json_encode([
            "success" => true, 
            "message" => "Login exitoso",
            "user_id" => $user['id']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
    }
} else {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
}
?>