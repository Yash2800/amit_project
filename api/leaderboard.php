<?php
// api/leaderboard.php
require_once 'config/database.php';

header("Content-Type: application/json");

try {
    $stmt = $db->query("
        SELECT 
            r.id, r.user_id, r.category_id, r.score_total,
            u.name as pilot_name,
            c.name as category_name
        FROM registrations r
        JOIN users u ON r.user_id = u.id
        JOIN categories c ON r.category_id = c.id
        WHERE r.status = 'approved' AND r.score_total IS NOT NULL
        ORDER BY r.category_id ASC, r.score_total DESC
    ");
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Group by category
    $leaderboard = [];
    foreach ($results as $row) {
        $cat = $row['category_name'];
        if (!isset($leaderboard[$cat])) {
            $leaderboard[$cat] = [];
        }
        $leaderboard[$cat][] = [
            'id' => $row['id'],
            'pilot_name' => $row['pilot_name'],
            'score_total' => $row['score_total']
        ];
    }

    echo json_encode(["status" => "success", "leaderboard" => $leaderboard]);

} catch (PDOException $e) {
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
