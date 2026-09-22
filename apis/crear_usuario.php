<?php
header("Content-Type: text/plain");

 $host = 'localhost';
 $dbname = 'login_db';
 $user = 'root';
 $pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $email = 'admin@test.com';
    $passwordPlano = '123456';
    
    // Aquí PHP encripta la contraseña de forma segura
    $passwordHash = password_hash($passwordPlano, PASSWORD_DEFAULT);

    // Borramos el usuario anterior si existe para no duplicarlo
    $pdo->prepare("DELETE FROM users WHERE email = ?")->execute([$email]);

    // Insertamos el usuario con la NUEVA contraseña encriptada
    $stmt = $pdo->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
    $stmt->execute([$email, $passwordHash]);

    echo "¡Usuario creado correctamente! Ya puedes iniciar sesión.\n";
    echo "Email: " . $email . "\n";
    echo "Hash generado: " . $passwordHash;

} catch (PDOException $e) {
    echo "Error al crear usuario: " . $e->getMessage();
}
?>