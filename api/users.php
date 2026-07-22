<?php
// api/users.php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/auth.php';

$user = get_auth_user($db);
if (!$user || $user['role'] !== 'admin') {
    echo json_encode(["error" => "Access denied. Admin role required."]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$action = $_GET['action'] ?? $input['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Return all users
    $stmt = $db->query("SELECT id, name, email, role, father_name, education, address, aadhar_card, experience_plane, experience_heli, experience_glider, experience_jet, competition_exp, judging_exp, models_bringing, allow_profile_edit FROM users ORDER BY name ASC");
    $users_list = $stmt->fetchAll();
    
    // Fetch assignments for commissioners
    $assignments = $db->query("SELECT cc.user_id, cc.category_id, c.name as category_name 
                               FROM commissioner_categories cc
                               JOIN categories c ON cc.category_id = c.id")->fetchAll();
                               
    // Group assignments by user_id
    $grouped_assignments = [];
    foreach ($assignments as $a) {
        $grouped_assignments[$a['user_id']][] = [
            "category_id" => $a['category_id'],
            "category_name" => $a['category_name']
        ];
    }
    
    foreach ($users_list as &$u) {
        $u['assignments'] = $grouped_assignments[$u['id']] ?? [];
    }
    
    echo json_encode(["users" => $users_list]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'update_role') {
        $target_user_id = intval($input['user_id'] ?? 0);
        $role = trim($input['role'] ?? '');
        
        if ($target_user_id <= 0 || !in_array($role, ['admin', 'commissioner', 'user'])) {
            echo json_encode(["error" => "Invalid parameters"]);
            exit();
        }
        
        // Prevent editing the active super admin's role
        if ($target_user_id === 1) {
            echo json_encode(["error" => "Cannot modify Super Administrator"]);
            exit();
        }
        
        $stmt = $db->prepare("UPDATE users SET role = ? WHERE id = ?");
        try {
            $stmt->execute([$role, $target_user_id]);
            
            // If role changes from commissioner, wipe their category assignments
            if ($role !== 'commissioner') {
                $del = $db->prepare("DELETE FROM commissioner_categories WHERE user_id = ?");
                $del->execute([$target_user_id]);
            }
            
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Failed to update role: " . $e->getMessage()]);
        }
        exit();
    }
    
    if ($action === 'assign_commissioner') {
        $target_user_id = intval($input['user_id'] ?? 0);
        $category_id = intval($input['category_id'] ?? 0);
        
        if ($target_user_id <= 0 || $category_id <= 0) {
            echo json_encode(["error" => "Invalid user or category ID"]);
            exit();
        }
        
        // Verify user is actually a commissioner
        $chkUser = $db->prepare("SELECT role FROM users WHERE id = ?");
        $chkUser->execute([$target_user_id]);
        $role = $chkUser->fetchColumn();
        
        if ($role !== 'commissioner') {
            echo json_encode(["error" => "User is not a commissioner. Set role first."]);
            exit();
        }
        
        $stmt = $db->prepare("INSERT OR IGNORE INTO commissioner_categories (user_id, category_id) VALUES (?, ?)");
        try {
            $stmt->execute([$target_user_id, $category_id]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Failed to assign category: " . $e->getMessage()]);
        }
        exit();
    }
    
    if ($action === 'remove_commissioner') {
        $target_user_id = intval($input['user_id'] ?? 0);
        $category_id = intval($input['category_id'] ?? 0);
        
        if ($target_user_id <= 0 || $category_id <= 0) {
            echo json_encode(["error" => "Invalid parameters"]);
            exit();
        }
        
        $stmt = $db->prepare("DELETE FROM commissioner_categories WHERE user_id = ? AND category_id = ?");
        try {
            $stmt->execute([$target_user_id, $category_id]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Failed to remove assignment: " . $e->getMessage()]);
        }
        exit();
    }
    
    if ($action === 'unlock_profile') {
        $target_user_id = intval($input['user_id'] ?? 0);
        if ($target_user_id <= 0) {
            echo json_encode(["error" => "Invalid user ID"]);
            exit();
        }
        
        $stmt = $db->prepare("UPDATE users SET allow_profile_edit = 1 WHERE id = ?");
        try {
            $stmt->execute([$target_user_id]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Failed to unlock profile: " . $e->getMessage()]);
        }
        exit();
    }
}
