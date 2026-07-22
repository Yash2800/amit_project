<?php
// api/auth.php
require_once __DIR__ . '/config/database.php';

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$action = $_GET['action'] ?? $input['action'] ?? '';

// Helper to decode bearer token and return user details or false
function get_auth_user($db) {
    $headers = getallheaders();
    $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
        $token = $matches[1];
        $decoded = json_decode(base64_decode($token), true);
        if ($decoded && isset($decoded['id'])) {
            $stmt = $db->prepare("SELECT id, name, email, role, father_name, education, address, mobile, aadhar_card, experience_plane, experience_heli, experience_glider, experience_jet, competition_exp, judging_exp, models_bringing, allow_profile_edit FROM users WHERE id = ?");
            $stmt->execute([$decoded['id']]);
            return $stmt->fetch();
        }
    }
    return false;
}

if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($action === 'register') {
            $name = trim($input['name'] ?? '');
            $email = trim($input['email'] ?? '');
            $password = $input['password'] ?? '';
            
            if (empty($name) || empty($email) || empty($password)) {
                echo json_encode(["error" => "Name, email and password are required"]);
                exit();
            }

            // Validate unique email
            $chk = $db->prepare("SELECT id FROM users WHERE email = ?");
            $chk->execute([$email]);
            if ($chk->fetch()) {
                echo json_encode(["error" => "Email is already registered"]);
                exit();
            }

            // Insert new user
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $ins = $db->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')");
            try {
                $ins->execute([$name, $email, $hashed]);
                $user_id = $db->lastInsertId();
                
                $token = base64_encode(json_encode(["id" => $user_id, "email" => $email, "role" => "user"]));
                echo json_encode([
                    "status" => "success",
                    "token" => $token,
                    "user" => [
                        "id" => $user_id,
                        "name" => $name,
                        "email" => $email,
                        "role" => "user"
                    ]
                ]);
            } catch (PDOException $e) {
                echo json_encode(["error" => "Registration failed: " . $e->getMessage()]);
            }
            exit();
        }

        if ($action === 'login') {
            $email = trim($input['email'] ?? '');
            $password = $input['password'] ?? '';

            if (empty($email) || empty($password)) {
                echo json_encode(["error" => "Email and password are required"]);
                exit();
            }

            $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                $token = base64_encode(json_encode([
                    "id" => $user['id'],
                    "email" => $user['email'],
                    "role" => $user['role']
                ]));
                echo json_encode([
                    "status" => "success",
                    "token" => $token,
                    "user" => [
                        "id" => $user['id'],
                        "name" => $user['name'],
                        "email" => $user['email'],
                        "role" => $user['role'],
                        "father_name" => $user['father_name'],
                        "education" => $user['education'],
                        "address" => $user['address'],
                        "mobile" => $user['mobile'],
                        "aadhar_card" => $user['aadhar_card'],
                        "experience_plane" => $user['experience_plane'],
                        "experience_heli" => $user['experience_heli'],
                        "experience_glider" => $user['experience_glider'],
                        "experience_jet" => $user['experience_jet'],
                        "competition_exp" => $user['competition_exp'],
                        "judging_exp" => $user['judging_exp'],
                        "models_bringing" => $user['models_bringing'],
                        "allow_profile_edit" => $user['allow_profile_edit']
                    ]
                ]);
            } else {
                echo json_encode(["error" => "Invalid email or password"]);
            }
            exit();
        }
        
        if ($action === 'update_profile') {
            $user = get_auth_user($db);
            if (!$user) {
                echo json_encode(["error" => "Unauthorized"]);
                exit();
            }
            
            $father_name = trim($input['father_name'] ?? '');
            $education = trim($input['education'] ?? '');
            $address = trim($input['address'] ?? '');
            $mobile = trim($input['mobile'] ?? '');
            $aadhar_card = trim($input['aadhar_card'] ?? '');
            $experience_plane = trim($input['experience_plane'] ?? '');
            $experience_heli = trim($input['experience_heli'] ?? '');
            $experience_glider = trim($input['experience_glider'] ?? '');
            $experience_jet = trim($input['experience_jet'] ?? '');
            $competition_exp = trim($input['competition_exp'] ?? '');
            $judging_exp = trim($input['judging_exp'] ?? '');
            $models_bringing = trim($input['models_bringing'] ?? '');
            $name = trim($input['name'] ?? $user['name']);

            // Check if user has any approved registrations
            $chk = $db->prepare("SELECT id FROM registrations WHERE user_id = ? AND status = 'approved' LIMIT 1");
            $chk->execute([$user['id']]);
            $hasApproved = $chk->fetch();

            if ($hasApproved) {
                // Ignore submitted name/address if application is already accepted
                $name = $user['name'];
                $address = $user['address'];
            }
            
            $stmt = $db->prepare("UPDATE users SET 
                name = ?, father_name = ?, education = ?, address = ?, mobile = ?, aadhar_card = ?, 
                experience_plane = ?, experience_heli = ?, experience_glider = ?, experience_jet = ?, 
                competition_exp = ?, judging_exp = ?, models_bringing = ?
                WHERE id = ?");
                
            try {
                $stmt->execute([
                    $name, $father_name, $education, $address, $mobile, $aadhar_card,
                    $experience_plane, $experience_heli, $experience_glider, $experience_jet,
                    $competition_exp, $judging_exp, $models_bringing,
                    $user['id']
                ]);
                
                // Get updated profile
                $get = $db->prepare("SELECT id, name, email, role, father_name, education, address, mobile, aadhar_card, experience_plane, experience_heli, experience_glider, experience_jet, competition_exp, judging_exp, models_bringing, allow_profile_edit FROM users WHERE id = ?");
                $get->execute([$user['id']]);
                
                echo json_encode([
                    "status" => "success",
                    "user" => $get->fetch()
                ]);
            } catch (PDOException $e) {
                echo json_encode(["error" => "Profile update failed: " . $e->getMessage()]);
            }
            exit();
        }
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user = get_auth_user($db);
        if ($user) {
            echo json_encode(["user" => $user]);
        } else {
            echo json_encode(["error" => "Unauthorized"]);
        }
        exit();
    }
}
