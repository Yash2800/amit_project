<?php
// api/leaderboard.php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/auth.php';

// Leaderboard is public, authorization is optional
$user = get_auth_user($db);

$category_id = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;
$age_group = isset($_GET['age_group']) ? trim($_GET['age_group']) : '';

if ($category_id > 0) {
    // Return leaderboard for specific category, filtered optionally by age group
    $query = "SELECT r.id, r.user_id, r.age_group, r.model_name, r.brand, 
                     r.score_flight1, r.score_flight2, r.score_freestyle, r.score_landing, r.score_total,
                     u.name as pilot_name, c.name as category_name
              FROM registrations r
              JOIN users u ON r.user_id = u.id
              JOIN categories c ON r.category_id = c.id
              WHERE r.category_id = ? AND r.tech_status = 'passed' AND r.status = 'approved'";
              
    $params = [$category_id];
    
    if (!empty($age_group)) {
        $query .= " AND r.age_group = ?";
        $params[] = $age_group;
    }
    
    $query .= " ORDER BY r.score_total DESC, r.id ASC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $results = $stmt->fetchAll();
    
    echo json_encode(["leaderboard" => $results]);
    exit();
} else {
    // Return all leaders summarized across all categories
    $query = "SELECT r.id, r.category_id, r.age_group, r.model_name, r.score_total,
                     u.name as pilot_name, c.name as category_name
              FROM registrations r
              JOIN users u ON r.user_id = u.id
              JOIN categories c ON r.category_id = c.id
              WHERE r.tech_status = 'passed' AND r.status = 'approved' AND r.score_total IS NOT NULL
              ORDER BY c.name ASC, r.age_group ASC, r.score_total DESC";
              
    $stmt = $db->prepare($query);
    $stmt->execute();
    $results = $stmt->fetchAll();
    
    echo json_encode(["leaderboards" => $results]);
    exit();
}
