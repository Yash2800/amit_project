<?php
// api/config/database.php
if (isset($_SERVER['REQUEST_METHOD'])) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
}

$db_file = __DIR__ . '/../database.sqlite';

try {
    $db = new PDO("sqlite:" . $db_file);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// Function to initialize tables and seed data
function init_database($db) {
    // 1. Create Users Table
    $db->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        father_name TEXT,
        education TEXT,
        address TEXT,
        experience_plane TEXT,
        experience_heli TEXT,
        experience_glider TEXT,
        experience_jet TEXT,
        competition_exp TEXT,
        judging_exp TEXT,
        models_bringing TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Ensure allow_profile_edit column exists
    try {
        $db->exec("ALTER TABLE users ADD COLUMN allow_profile_edit INTEGER DEFAULT 0");
    } catch (PDOException $e) {
        // Column already exists, ignore
    }

    // 2. Create Categories Table
    $db->exec("CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        aircraft_type TEXT NOT NULL, -- 'heli', 'plane', 'glider', 'control_line'
        min_specs TEXT -- JSON configuration
    )");

    // 3. Create Registrations Table
    $db->exec("CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        age_group TEXT NOT NULL, -- '20 years and below', '21 years to 50 years', '51 years and above'
        model_name TEXT NOT NULL,
        brand TEXT NOT NULL,
        wing_span REAL,
        rotor_dia REAL,
        engine_type TEXT, -- 'nitro', 'electric', 'petrol', 'turbine'
        engine_brand TEXT,
        engine_size TEXT,
        tech_status TEXT DEFAULT 'pending', -- 'pending', 'passed', 'failed'
        tech_remarks TEXT,
        score_flight1 REAL DEFAULT NULL,
        score_flight2 REAL DEFAULT NULL,
        score_freestyle REAL DEFAULT NULL,
        score_landing REAL DEFAULT NULL,
        score_total REAL DEFAULT NULL,
        status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(category_id) REFERENCES categories(id),
        UNIQUE(user_id, category_id)
    )");

    // 4. Create Commissioner Category Assignment Table
    $db->exec("CREATE TABLE IF NOT EXISTS commissioner_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(category_id) REFERENCES categories(id),
        UNIQUE(user_id, category_id)
    )");

    // Check if categories are already seeded
    $stmt = $db->query("SELECT COUNT(*) FROM categories");
    if ($stmt->fetchColumn() == 0) {
        $categories = [
            [
                "name" => "RC Heli Aerobatics (Nitro Engine/ Electric)",
                "aircraft_type" => "heli",
                "min_specs" => json_encode([
                    "min_rotor_dia" => 124,
                    "allowed_engines" => ["nitro", "electric"],
                    "min_engine_size_nitro" => "0.30 (5.5 cc)",
                    "min_motor_kv" => 800,
                    "notes" => "Pilot should be able to perform aerobatics safely"
                ])
            ],
            [
                "name" => "RC Heli Freestyle Nitro Engine",
                "aircraft_type" => "heli",
                "min_specs" => json_encode([
                    "min_rotor_dia" => 124,
                    "allowed_engines" => ["nitro"],
                    "min_engine_size_nitro" => "0.30 (5.5 cc)",
                    "notes" => "Pilot should be able to perform aerobatics safely"
                ])
            ],
            [
                "name" => "RC Heli Freestyle Electric Motor",
                "aircraft_type" => "heli",
                "min_specs" => json_encode([
                    "min_rotor_dia" => 124,
                    "allowed_engines" => ["electric"],
                    "min_motor_kv" => 800,
                    "notes" => "Pilot should be able to perform aerobatics safely"
                ])
            ],
            [
                "name" => "RC Plane Aerobatics (Nitro Engine/ Electric)",
                "aircraft_type" => "plane",
                "min_specs" => json_encode([
                    "min_wing_span" => 165,
                    "max_wing_span" => 200,
                    "allowed_engines" => ["nitro", "electric"],
                    "min_engine_size_nitro" => "0.46 (7.5 cc)",
                    "max_engine_size_nitro" => "0.90 (14.75 cc)",
                    "min_motor_kv" => 800,
                    "max_motor_kv" => 400,
                    "notes" => "Pilot should be able to perform aerobatics safely"
                ])
            ],
            [
                "name" => "RC Plane Freestyle Nitro Engine",
                "aircraft_type" => "plane",
                "min_specs" => json_encode([
                    "min_wing_span" => 165,
                    "max_wing_span" => 200,
                    "allowed_engines" => ["nitro"],
                    "min_engine_size_nitro" => "0.46 (7.5 cc)",
                    "max_engine_size_nitro" => "0.90 (14.75 cc)",
                    "notes" => "Pilot should be able to perform aerobatics safely"
                ])
            ],
            [
                "name" => "RC Plane Freestyle Electric Motor",
                "aircraft_type" => "plane",
                "min_specs" => json_encode([
                    "min_wing_span" => 165,
                    "max_wing_span" => 200,
                    "allowed_engines" => ["electric"],
                    "min_motor_kv" => 800,
                    "max_motor_kv" => 400,
                    "notes" => "Pilot should be able to perform aerobatics safely"
                ])
            ],
            [
                "name" => "RC Plane Aerobatics Petrol Engine",
                "aircraft_type" => "plane",
                "min_specs" => json_encode([
                    "min_wing_span" => 200,
                    "max_wing_span" => 270,
                    "allowed_engines" => ["petrol"],
                    "min_engine_size_petrol" => "DLE 20 (20 cc)",
                    "max_engine_size_petrol" => "DLE 65 (65 cc)",
                    "notes" => "Pilot should be able to perform aerobatics safely"
                ])
            ],
            [
                "name" => "RC Plane Freestyle Petrol Engine",
                "aircraft_type" => "plane",
                "min_specs" => json_encode([
                    "min_wing_span" => 200,
                    "max_wing_span" => 270,
                    "allowed_engines" => ["petrol"],
                    "min_engine_size_petrol" => "DLE 20 (20 cc)",
                    "max_engine_size_petrol" => "DLE 65 (65 cc)",
                    "notes" => "Pilot should be able to perform aerobatics safely"
                ])
            ],
            [
                "name" => "RC Plane Aerobatics Turbine Engine up to 10 kg thrust",
                "aircraft_type" => "plane",
                "min_specs" => json_encode([
                    "allowed_engines" => ["turbine"],
                    "max_turbine_thrust" => 10,
                    "notes" => "Pilot should be able to perform aerobatics safely"
                ])
            ],
            [
                "name" => "RC Plane Freestyle Turbine Engine up to 10 kg thrust",
                "aircraft_type" => "plane",
                "min_specs" => json_encode([
                    "allowed_engines" => ["turbine"],
                    "max_turbine_thrust" => 10,
                    "notes" => "Pilot should be able to perform aerobatics safely"
                ])
            ],
            [
                "name" => "RC Plane Aerobatics Turbine Engine more than 10 kg thrust",
                "aircraft_type" => "plane",
                "min_specs" => json_encode([
                    "allowed_engines" => ["turbine"],
                    "min_turbine_thrust" => 11,
                    "notes" => "Pilot should be able to perform aerobatics safely"
                ])
            ],
            [
                "name" => "RC Plane Freestyle Turbine Engine more than 10 kg thrust",
                "aircraft_type" => "plane",
                "min_specs" => json_encode([
                    "allowed_engines" => ["turbine"],
                    "min_turbine_thrust" => 11,
                    "notes" => "Pilot should be able to perform aerobatics safely"
                ])
            ],
            [
                "name" => "RC Glider max duration flight (any Engine/ Electric)",
                "aircraft_type" => "glider",
                "min_specs" => json_encode([
                    "min_wing_span" => 200,
                    "allowed_engines" => ["nitro", "electric", "petrol", "glider_tow"],
                    "notes" => "30 sec of thrust to gain height"
                ])
            ],
            [
                "name" => "RC Glider spot landing (Engine/ Electric)",
                "aircraft_type" => "glider",
                "min_specs" => json_encode([
                    "min_wing_span" => 200,
                    "allowed_engines" => ["nitro", "electric", "petrol", "glider_tow"],
                    "notes" => "30 sec of thrust to gain height"
                ])
            ],
            [
                "name" => "Control Line Aerobatics (Engine/ Electric)",
                "aircraft_type" => "control_line",
                "min_specs" => json_encode([
                    "allowed_engines" => ["nitro", "electric", "petrol"],
                    "notes" => "Any size Control Line model powered by any size engine or electric motor"
                ])
            ]
        ];

        $ins = $db->prepare("INSERT INTO categories (name, aircraft_type, min_specs) VALUES (?, ?, ?)");
        foreach ($categories as $cat) {
            $ins->execute([$cat["name"], $cat["aircraft_type"], $cat["min_specs"]]);
        }
    }

    // Check if users are seeded
    $stmt = $db->query("SELECT COUNT(*) FROM users");
    if ($stmt->fetchColumn() == 0) {
        $users = [
            [
                "name" => "Super Administrator",
                "email" => "admin@aeroclub.com",
                "password" => password_hash("admin123", PASSWORD_DEFAULT),
                "role" => "admin",
                "father_name" => "Admin Father",
                "education" => "M.Tech Aerodynamics",
                "address" => "Aerodrome HQ, Runway Street, Delhi, 110001",
                "experience_plane" => "10 years, size 2.5m",
                "experience_heli" => "5 years, size 1.2m",
                "experience_glider" => "8 years, size 3m",
                "experience_jet" => "4 years, size 2m",
                "competition_exp" => "National RC Championship 2022 - Winner",
                "judging_exp" => "Judged Nationals 2024",
                "models_bringing" => "2 Planes, 1 Heli"
            ],
            [
                "name" => "Chief Commissioner",
                "email" => "judge@aeroclub.com",
                "password" => password_hash("judge123", PASSWORD_DEFAULT),
                "role" => "commissioner",
                "father_name" => "Judge Father",
                "education" => "B.Tech Aeronautical",
                "address" => "Judges Lounge, Skyway Plaza, Mumbai, 400001",
                "experience_plane" => "15 years, size 3m",
                "experience_heli" => "10 years, size 1.5m",
                "experience_glider" => "12 years, size 4m",
                "experience_jet" => "6 years, size 2.5m",
                "competition_exp" => "Asia Cup RC 2019 - Runner Up",
                "judging_exp" => "Chief Judge since 2021",
                "models_bringing" => "None"
            ],
            [
                "name" => "Ravi Kumar (Pilot)",
                "email" => "pilot@aeroclub.com",
                "password" => password_hash("pilot123", PASSWORD_DEFAULT),
                "role" => "user",
                "father_name" => "Suresh Kumar",
                "education" => "High School",
                "address" => "123 Green Valley, Sector 4, PIN 201301",
                "experience_plane" => "3 years, size 1.8m",
                "experience_heli" => "1 year, size 0.8m",
                "experience_glider" => "2 years, size 2m",
                "experience_jet" => "None",
                "competition_exp" => "State Level 2025 - Participated",
                "judging_exp" => "None",
                "models_bringing" => "1 RC Plane, 1 RC Glider"
            ]
        ];

        $ins = $db->prepare("INSERT INTO users (name, email, password, role, father_name, education, address, experience_plane, experience_heli, experience_glider, experience_jet, competition_exp, judging_exp, models_bringing) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($users as $u) {
            $ins->execute([
                $u["name"], $u["email"], $u["password"], $u["role"],
                $u["father_name"], $u["education"], $u["address"],
                $u["experience_plane"], $u["experience_heli"], $u["experience_glider"], $u["experience_jet"],
                $u["competition_exp"], $u["judging_exp"], $u["models_bringing"]
            ]);
        }

        // Auto-assign commissioner to category 1 and 4 by default for easy test demo
        $db->exec("INSERT OR IGNORE INTO commissioner_categories (user_id, category_id) VALUES (2, 1)");
        $db->exec("INSERT OR IGNORE INTO commissioner_categories (user_id, category_id) VALUES (2, 4)");
    }
}

init_database($db);
if (php_sapi_name() === 'cli' && basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    echo json_encode(["status" => "Database ready"]);
}
