<?php
require_once __DIR__ . '/api/config/database.php';
$stmt = $db->query("SELECT * FROM commissioner_categories");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
$stmt2 = $db->query("SELECT * FROM registrations");
print_r($stmt2->fetchAll(PDO::FETCH_ASSOC));
