<?php
// users.php
// API CRUD para la tabla `users`
// Métodos soportados: GET, POST, PUT, PATCH, DELETE, OPTIONS

// ---------------------------------------------------------
// HEADERS CORS
// ---------------------------------------------------------
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400'); // cache del preflight, 1 día
header('Content-Type: application/json; charset=utf-8');

// El navegador manda OPTIONS antes de POST/PUT/PATCH/DELETE (preflight).
// Respondemos 200 sin contenido y cortamos aquí.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

function responder($status, $data) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function obtenerBody() {
    $input = json_decode(file_get_contents('php://input'), true);
    return is_array($input) ? $input : [];
}

// Nunca devolvemos el hash de la contraseña en las respuestas
function limpiarUsuario($usuario) {
    unset($usuario['password']);
    return $usuario;
}

// ---------------------------------------------------------
// Obtener el ID desde query string (?id=1) o desde el path (/users.php/1)
// ---------------------------------------------------------
$id = null;

if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
} else {
    $pathInfo = $_SERVER['PATH_INFO'] ?? '';
    $partes = array_values(array_filter(explode('/', $pathInfo)));
    if (!empty($partes) && is_numeric($partes[0])) {
        $id = (int) $partes[0];
    }
}

$metodo = $_SERVER['REQUEST_METHOD'];

// ---------------------------------------------------------
// Enrutamiento por método HTTP
// ---------------------------------------------------------
try {
    switch ($metodo) {

        // -----------------------------------------------------
        // GET: listar todos los usuarios o uno por id
        // -----------------------------------------------------
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare('SELECT id, email, created_at FROM users WHERE id = :id');
                $stmt->execute(['id' => $id]);
                $usuario = $stmt->fetch();

                if (!$usuario) {
                    responder(404, ['success' => false, 'message' => 'Usuario no encontrado']);
                }

                responder(200, ['success' => true, 'data' => $usuario]);
            } else {
                $stmt = $pdo->query('SELECT id, email, created_at FROM users ORDER BY id DESC');
                $usuarios = $stmt->fetchAll();

                responder(200, ['success' => true, 'data' => $usuarios]);
            }
            break;

        // -----------------------------------------------------
        // POST: crear un nuevo usuario
        // -----------------------------------------------------
        case 'POST':
            $body = obtenerBody();

            if (empty($body['email']) || empty($body['password'])) {
                responder(400, ['success' => false, 'message' => 'email y password son obligatorios']);
            }

            if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
                responder(400, ['success' => false, 'message' => 'El email no es válido']);
            }

            // Verificar que el email no exista ya (columna UNIQUE)
            $check = $pdo->prepare('SELECT id FROM users WHERE email = :email');
            $check->execute(['email' => $body['email']]);
            if ($check->fetch()) {
                responder(409, ['success' => false, 'message' => 'El email ya está registrado']);
            }

            $hash = password_hash($body['password'], PASSWORD_DEFAULT);

            $stmt = $pdo->prepare('INSERT INTO users (email, password) VALUES (:email, :password)');
            $stmt->execute([
                'email'    => $body['email'],
                'password' => $hash
            ]);

            $nuevoId = $pdo->lastInsertId();

            $stmt = $pdo->prepare('SELECT id, email, created_at FROM users WHERE id = :id');
            $stmt->execute(['id' => $nuevoId]);
            $usuario = $stmt->fetch();

            responder(201, ['success' => true, 'message' => 'Usuario creado', 'data' => $usuario]);
            break;

        // -----------------------------------------------------
        // PUT: reemplazo completo del usuario (requiere email y password)
        // -----------------------------------------------------
        case 'PUT':
            if (!$id) {
                responder(400, ['success' => false, 'message' => 'Debes indicar el id del usuario (?id=)']);
            }

            $body = obtenerBody();

            if (empty($body['email']) || empty($body['password'])) {
                responder(400, ['success' => false, 'message' => 'PUT requiere email y password completos']);
            }

            if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
                responder(400, ['success' => false, 'message' => 'El email no es válido']);
            }

            $existe = $pdo->prepare('SELECT id FROM users WHERE id = :id');
            $existe->execute(['id' => $id]);
            if (!$existe->fetch()) {
                responder(404, ['success' => false, 'message' => 'Usuario no encontrado']);
            }

            $hash = password_hash($body['password'], PASSWORD_DEFAULT);

            $stmt = $pdo->prepare('UPDATE users SET email = :email, password = :password WHERE id = :id');
            $stmt->execute([
                'email'    => $body['email'],
                'password' => $hash,
                'id'       => $id
            ]);

            $stmt = $pdo->prepare('SELECT id, email, created_at FROM users WHERE id = :id');
            $stmt->execute(['id' => $id]);
            $usuario = $stmt->fetch();

            responder(200, ['success' => true, 'message' => 'Usuario actualizado', 'data' => $usuario]);
            break;

        // -----------------------------------------------------
        // PATCH: actualización parcial (solo los campos enviados)
        // -----------------------------------------------------
        case 'PATCH':
            if (!$id) {
                responder(400, ['success' => false, 'message' => 'Debes indicar el id del usuario (?id=)']);
            }

            $body = obtenerBody();

            $existe = $pdo->prepare('SELECT id FROM users WHERE id = :id');
            $existe->execute(['id' => $id]);
            if (!$existe->fetch()) {
                responder(404, ['success' => false, 'message' => 'Usuario no encontrado']);
            }

            $campos = [];
            $params = ['id' => $id];

            if (!empty($body['email'])) {
                if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
                    responder(400, ['success' => false, 'message' => 'El email no es válido']);
                }
                $campos[] = 'email = :email';
                $params['email'] = $body['email'];
            }

            if (!empty($body['password'])) {
                $campos[] = 'password = :password';
                $params['password'] = password_hash($body['password'], PASSWORD_DEFAULT);
            }

            if (empty($campos)) {
                responder(400, ['success' => false, 'message' => 'No se enviaron campos para actualizar']);
            }

            $sql = 'UPDATE users SET ' . implode(', ', $campos) . ' WHERE id = :id';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            $stmt = $pdo->prepare('SELECT id, email, created_at FROM users WHERE id = :id');
            $stmt->execute(['id' => $id]);
            $usuario = $stmt->fetch();

            responder(200, ['success' => true, 'message' => 'Usuario actualizado parcialmente', 'data' => $usuario]);
            break;

        // -----------------------------------------------------
        // DELETE: eliminar usuario por id
        // -----------------------------------------------------
        case 'DELETE':
            if (!$id) {
                responder(400, ['success' => false, 'message' => 'Debes indicar el id del usuario (?id=)']);
            }

            $existe = $pdo->prepare('SELECT id FROM users WHERE id = :id');
            $existe->execute(['id' => $id]);
            if (!$existe->fetch()) {
                responder(404, ['success' => false, 'message' => 'Usuario no encontrado']);
            }

            $stmt = $pdo->prepare('DELETE FROM users WHERE id = :id');
            $stmt->execute(['id' => $id]);

            responder(200, ['success' => true, 'message' => 'Usuario eliminado']);
            break;

        // -----------------------------------------------------
        // Método no soportado
        // -----------------------------------------------------
        default:
            responder(405, ['success' => false, 'message' => 'Método no permitido']);
            break;
    }
} catch (PDOException $e) {
    responder(500, ['success' => false, 'message' => 'Error en el servidor', 'error' => $e->getMessage()]);
}
