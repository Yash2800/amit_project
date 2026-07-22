<?php
// api/registrations.php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/auth.php';

$user = get_auth_user($db);
if (!$user) {
    echo json_encode(["error" => "Unauthorized. Login required."]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$action = $_GET['action'] ?? $input['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Determine target user's registrations based on role
    if ($user['role'] === 'user') {
        $stmt = $db->prepare("SELECT r.*, c.name as category_name, c.aircraft_type, c.min_specs, u.name as user_name 
                              FROM registrations r
                              JOIN categories c ON r.category_id = c.id
                              JOIN users u ON r.user_id = u.id
                              WHERE r.user_id = ?");
        $stmt->execute([$user['id']]);
    } elseif ($user['role'] === 'commissioner') {
        // Find categories assigned to this commissioner
        $assignStmt = $db->prepare("SELECT category_id FROM commissioner_categories WHERE user_id = ?");
        $assignStmt->execute([$user['id']]);
        $assigned_category_ids = $assignStmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (!empty($assigned_category_ids)) {
            $placeholders = implode(',', array_fill(0, count($assigned_category_ids), '?'));
            $stmt = $db->prepare("SELECT r.*, c.name as category_name, c.aircraft_type, c.min_specs, u.name as user_name, u.email as user_email
                                  FROM registrations r
                                  JOIN categories c ON r.category_id = c.id
                                  JOIN users u ON r.user_id = u.id
                                  WHERE r.category_id IN ($placeholders)");
            $stmt->execute($assigned_category_ids);
        } else {
            // If no assignments, fallback to all categories for demo/convenience
            $stmt = $db->query("SELECT r.*, c.name as category_name, c.aircraft_type, c.min_specs, u.name as user_name, u.email as user_email
                                FROM registrations r
                                JOIN categories c ON r.category_id = c.id
                                JOIN users u ON r.user_id = u.id");
        }
    } else { // Admin
        $stmt = $db->query("SELECT r.*, c.name as category_name, c.aircraft_type, c.min_specs, u.name as user_name, u.email as user_email, u.role as user_role
                            FROM registrations r
                            JOIN categories c ON r.category_id = c.id
                            JOIN users u ON r.user_id = u.id");
    }
    
    $registrations = $stmt->fetchAll();
    foreach ($registrations as &$reg) {
        $reg['min_specs'] = json_decode($reg['min_specs'], true);
    }
    
    echo json_encode(["registrations" => $registrations]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'register') {
        // Only User/Admin can register a new aircraft
        $target_user_id = ($user['role'] === 'admin') ? intval($input['user_id'] ?? $user['id']) : $user['id'];
        $category_id = intval($input['category_id'] ?? 0);
        $age_group = trim($input['age_group'] ?? '');
        $model_name = trim($input['model_name'] ?? '');
        $brand = trim($input['brand'] ?? '');
        $wing_span = isset($input['wing_span']) ? floatval($input['wing_span']) : null;
        $rotor_dia = isset($input['rotor_dia']) ? floatval($input['rotor_dia']) : null;
        $engine_type = trim($input['engine_type'] ?? '');
        $engine_brand = trim($input['engine_brand'] ?? '');
        $engine_size = trim($input['engine_size'] ?? '');

        $payment_status = trim($input['payment_status'] ?? 'pending');
        $payment_id = trim($input['payment_id'] ?? '');

        if ($category_id <= 0 || empty($age_group) || empty($model_name) || empty($brand)) {
            echo json_encode(["error" => "Category, Age Group, Model Name, and Brand are required fields."]);
            exit();
        }

        // Validate unique registration for this user + category
        $chk = $db->prepare("SELECT id FROM registrations WHERE user_id = ? AND category_id = ?");
        $chk->execute([$target_user_id, $category_id]);
        if ($chk->fetch()) {
            echo json_encode(["error" => "You are already registered for this category."]);
            exit();
        }

        $ins = $db->prepare("INSERT INTO registrations (
            user_id, category_id, age_group, model_name, brand, wing_span, rotor_dia, engine_type, engine_brand, engine_size, tech_status, status, payment_status, payment_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?)");
        
        try {
            $ins->execute([
                $target_user_id, $category_id, $age_group, $model_name, $brand, $wing_span, $rotor_dia, $engine_type, $engine_brand, $engine_size, $payment_status, $payment_id
            ]);
            echo json_encode(["status" => "success", "id" => $db->lastInsertId()]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Registration submission failed: " . $e->getMessage()]);
        }
        exit();
    }

    if ($action === 'tech_check') {
        // Only Commissioner or Admin can do tech checklist
        if ($user['role'] !== 'commissioner' && $user['role'] !== 'admin') {
            echo json_encode(["error" => "Access denied. Commissioner or Admin required."]);
            exit();
        }

        $id = intval($input['id'] ?? 0);
        $tech_status = trim($input['tech_status'] ?? 'pending'); // 'passed' or 'failed'
        $tech_remarks = trim($input['tech_remarks'] ?? '');

        if ($id <= 0 || !in_array($tech_status, ['passed', 'failed'])) {
            echo json_encode(["error" => "Invalid registration ID or technical status."]);
            exit();
        }

        $stmt = $db->prepare("UPDATE registrations SET tech_status = ?, tech_remarks = ? WHERE id = ?");
        try {
            $stmt->execute([$tech_status, $tech_remarks, $id]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Failed to update technical inspection: " . $e->getMessage()]);
        }
        exit();
    }

    if ($action === 'score') {
        // Only Commissioner or Admin can enter scores
        if ($user['role'] !== 'commissioner' && $user['role'] !== 'admin') {
            echo json_encode(["error" => "Access denied. Commissioner or Admin required."]);
            exit();
        }

        $id = intval($input['id'] ?? 0);
        $score_flight1 = isset($input['score_flight1']) && $input['score_flight1'] !== '' ? floatval($input['score_flight1']) : null;
        $score_flight2 = isset($input['score_flight2']) && $input['score_flight2'] !== '' ? floatval($input['score_flight2']) : null;
        $score_freestyle = isset($input['score_freestyle']) && $input['score_freestyle'] !== '' ? floatval($input['score_freestyle']) : null;
        $score_landing = isset($input['score_landing']) && $input['score_landing'] !== '' ? floatval($input['score_landing']) : null;

        if ($id <= 0) {
            echo json_encode(["error" => "Invalid registration ID"]);
            exit();
        }

        // Calculate score_total automatically
        // Example logic: sum up all active scores
        $total = 0;
        $count = 0;
        if ($score_flight1 !== null) { $total += $score_flight1; $count++; }
        if ($score_flight2 !== null) { $total += $score_flight2; $count++; }
        if ($score_freestyle !== null) { $total += $score_freestyle; $count++; }
        if ($score_landing !== null) { $total += $score_landing; $count++; }
        
        $score_total = ($count > 0) ? $total : null;

        $stmt = $db->prepare("UPDATE registrations SET 
            score_flight1 = ?, score_flight2 = ?, score_freestyle = ?, score_landing = ?, score_total = ? 
            WHERE id = ?");
            
        try {
            $stmt->execute([$score_flight1, $score_flight2, $score_freestyle, $score_landing, $score_total, $id]);
            echo json_encode(["status" => "success", "score_total" => $score_total]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Failed to update scores: " . $e->getMessage()]);
        }
        exit();
    }

    if ($action === 'update_status') {
        // Only Admin can approve/reject registration
        if ($user['role'] !== 'admin') {
            echo json_encode(["error" => "Access denied. Admin required."]);
            exit();
        }

        $id = intval($input['id'] ?? 0);
        $status = trim($input['status'] ?? 'pending'); // 'approved', 'rejected', 'pending'

        if ($id <= 0 || !in_array($status, ['approved', 'rejected', 'pending'])) {
            echo json_encode(["error" => "Invalid registration ID or status."]);
            exit();
        }

        $stmt = $db->prepare("UPDATE registrations SET status = ? WHERE id = ?");
        try {
            $stmt->execute([$status, $id]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Failed to update status: " . $e->getMessage()]);
        }
        exit();
    }
}
