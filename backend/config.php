<?php
// backend/config.php

if (isset($_SERVER['REQUEST_METHOD'])) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
}

$db_env = getenv('DB_PATH') ?: ($_ENV['DB_PATH'] ?? ($_SERVER['DB_PATH'] ?? ''));
if (!empty($db_env)) {
    if (preg_match('/^\//', $db_env) || preg_match('/^[a-zA-Z]:/', $db_env)) {
        $db_file = $db_env;
    } else {
        $db_file = __DIR__ . '/../' . $db_env;
    }
} else {
    $db_file = __DIR__ . '/../api/database.sqlite';
}

try {
    $db = new PDO("sqlite:" . $db_file);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit();
}
