<?php
// ===============================================
// mi_equipo.php — API para "Mi Equipo Fantasy"
// GET    ?user_id=1                  → catálogo + roster + total
// POST   {user_id, player_id}        → agrega al roster
// DELETE ?user_id=1&player_id=5      → quita del roster
// ===============================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ⚠️ AJUSTA la conexión igual que en tu users.php
 $mysqli = new mysqli('localhost', 'root', '', 'login_db');
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la BD']);
    exit;
}
 $mysqli->set_charset('utf8mb4');

// Fórmula fantasy: 25 yds = 1 pto | TD = 4 | INT = -2
 $PTS = "ROUND(COALESCE(SUM(s.pass_yds * 0.04 + s.td * 4 - s.interceptions * 2), 0), 1)";
 $STATS_JOIN = "LEFT JOIN passing_stats s
                 ON s.player_id = p.id
                AND s.season = 2026
                AND s.season_type = 'REG'";

function responder(int $code, array $data): void {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

 $method = $_SERVER['REQUEST_METHOD'];
 $input  = json_decode(file_get_contents('php://input'), true) ?: [];

switch ($method) {

    // ---------- GET: catálogo + roster + total ----------
    case 'GET':
        $user_id = intval($_GET['user_id'] ?? 0);
        if ($user_id <= 0) {
            responder(400, ['error' => 'Falta user_id']);
        }

        // Roster del usuario (orden de agregado)
        $sql = "SELECT p.id, p.player_name, p.team, p.conference, p.division, p.position,
                       {$PTS} AS puntos
                FROM mi_equipo m
                JOIN players p ON p.id = m.player_id
                {$STATS_JOIN}
                WHERE m.user_id = ?
                GROUP BY p.id, p.player_name, p.team, p.conference, p.division, p.position, m.created_at
                ORDER BY m.created_at ASC";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $roster = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        // Catálogo completo con puntos
        $sql = "SELECT p.id, p.player_name, p.team, p.conference, p.division, p.position,
                       {$PTS} AS puntos
                FROM players p
                {$STATS_JOIN}
                GROUP BY p.id, p.player_name, p.team, p.conference, p.division, p.position
                ORDER BY puntos DESC, p.player_name ASC";
        $stmt = $mysqli->prepare($sql);
        $stmt->execute();
        $jugadores = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        $total = 0;
        foreach ($roster as $r) {
            $total += (float) $r['puntos'];
        }

        responder(200, [
            'roster'       => $roster,
            'jugadores'    => $jugadores,
            'total_puntos' => round($total, 1)
        ]);

    // ---------- POST: agregar al roster ----------
    case 'POST':
        $user_id   = intval($input['user_id'] ?? 0);
        $player_id = intval($input['player_id'] ?? 0);
        if ($user_id <= 0 || $player_id <= 0) {
            responder(400, ['error' => 'Falta user_id o player_id']);
        }

        $stmt = $mysqli->prepare("INSERT INTO mi_equipo (user_id, player_id) VALUES (?, ?)");
        $stmt->bind_param('ii', $user_id, $player_id);
        if (!$stmt->execute()) {
            // 1062 = violación del UNIQUE (user_id + player_id)
            if ($stmt->errno === 1062) {
                responder(409, ['error' => 'Ese jugador ya está en tu equipo']);
            }
            responder(500, ['error' => 'Error al agregar: ' . $stmt->error]);
        }
        responder(201, ['success' => 'Jugador agregado a tu equipo']);

    // ---------- DELETE: quitar del roster ----------
    case 'DELETE':
        $user_id   = intval($input['user_id'] ?? $_GET['user_id'] ?? 0);
        $player_id = intval($input['player_id'] ?? $_GET['player_id'] ?? 0);
        if ($user_id <= 0 || $player_id <= 0) {
            responder(400, ['error' => 'Falta user_id o player_id']);
        }

        $stmt = $mysqli->prepare("DELETE FROM mi_equipo WHERE user_id = ? AND player_id = ?");
        $stmt->bind_param('ii', $user_id, $player_id);
        $stmt->execute();
        if ($stmt->affected_rows === 0) {
            responder(404, ['error' => 'El jugador no estaba en tu equipo']);
        }
        responder(200, ['success' => 'Jugador eliminado de tu equipo']);

    default:
        responder(405, ['error' => 'Método no permitido']);
}