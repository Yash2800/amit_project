<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/auth.php';

function is_admin($db) {
    $user = get_auth_user($db);
    return $user && $user['role'] === 'admin';
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all active flash updates
    $stmt = $db->query("SELECT * FROM flash_updates WHERE is_active = 1 ORDER BY created_at DESC");
    $updates = $stmt->fetchAll();
    echo json_encode(["updates" => $updates]);
    exit();
}

if ($method === 'POST') {
    if (!is_admin($db)) {
        http_response_code(403);
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $message = $data['message'] ?? '';
    
    if (empty($message)) {
        http_response_code(400);
        echo json_encode(["error" => "Message is required"]);
        exit();
    }
    
    $stmt = $db->prepare("INSERT INTO flash_updates (message) VALUES (?)");
    if ($stmt->execute([$message])) {
        echo json_encode(["status" => "success", "id" => $db->lastInsertId(), "message" => "Flash update added"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to add flash update"]);
    }
    exit();
}

if ($method === 'DELETE') {
    if (!is_admin($db)) {
        http_response_code(403);
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }
    
    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["error" => "ID is required"]);
        exit();
    }
    
    $stmt = $db->prepare("DELETE FROM flash_updates WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(["status" => "success", "message" => "Flash update deleted"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to delete flash update"]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
