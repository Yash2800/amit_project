<?php
// api/categories.php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/auth.php';

$user = get_auth_user($db);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Both logged in users and visitors can list categories
    $stmt = $db->query("SELECT * FROM categories");
    $categories = $stmt->fetchAll();
    
    // Decode JSON specs for frontend convenience
    foreach ($categories as &$cat) {
        $cat['min_specs'] = json_decode($cat['min_specs'], true);
    }
    
    echo json_encode(["categories" => $categories]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$user || $user['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized. Admin role required."]);
        exit();
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? '';
    
    if ($action === 'create') {
        $name = trim($input['name'] ?? '');
        $aircraft_type = trim($input['aircraft_type'] ?? 'plane');
        $min_specs = $input['min_specs'] ?? [];
        
        if (empty($name)) {
            echo json_encode(["error" => "Category name is required"]);
            exit();
        }
        
        $stmt = $db->prepare("INSERT INTO categories (name, aircraft_type, min_specs) VALUES (?, ?, ?)");
        try {
            $stmt->execute([$name, $aircraft_type, json_encode($min_specs)]);
            echo json_encode(["status" => "success", "id" => $db->lastInsertId()]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Failed to create category: " . $e->getMessage()]);
        }
        exit();
    }
    
    if ($action === 'update') {
        $id = intval($input['id'] ?? 0);
        $name = trim($input['name'] ?? '');
        $aircraft_type = trim($input['aircraft_type'] ?? '');
        $min_specs = $input['min_specs'] ?? [];
        
        if ($id <= 0 || empty($name) || empty($aircraft_type)) {
            echo json_encode(["error" => "Invalid ID, name or aircraft type"]);
            exit();
        }
        
        $stmt = $db->prepare("UPDATE categories SET name = ?, aircraft_type = ?, min_specs = ? WHERE id = ?");
        try {
            $stmt->execute([$name, $aircraft_type, json_encode($min_specs), $id]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Failed to update category: " . $e->getMessage()]);
        }
        exit();
    }

    if ($action === 'delete') {
        $id = intval($input['id'] ?? 0);
        if ($id <= 0) {
            echo json_encode(["error" => "Invalid ID"]);
            exit();
        }
        
        $stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
        try {
            $stmt->execute([$id]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Failed to delete category: " . $e->getMessage()]);
        }
        exit();
    }
}
