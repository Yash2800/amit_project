<?php
// index.php - Root Router for Production Deployment on Render

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// 1. Route API requests to the api folder
if (strpos($uri, '/api/') === 0) {
    $api_file = __DIR__ . $uri;
    if (file_exists($api_file)) {
        require_once $api_file;
        exit();
    }
}

// 2. Serve static assets from 'dist' folder
$dist_file = __DIR__ . '/dist' . $uri;
if ($uri !== '/' && file_exists($dist_file) && !is_dir($dist_file)) {
    $ext = pathinfo($dist_file, PATHINFO_EXTENSION);
    $mimes = [
        'html' => 'text/html',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'webp' => 'image/webp'
    ];
    $mime = $mimes[$ext] ?? 'application/octet-stream';
    header("Content-Type: " . $mime);
    readfile($dist_file);
    exit();
}

// 3. Fallback to index.html for Single Page Application routing (React Router)
if (file_exists(__DIR__ . '/dist/index.html')) {
    header("Content-Type: text/html");
    readfile(__DIR__ . '/dist/index.html');
    exit();
}

echo "AeroManager: Compiled build not found. Please build locally and push the 'dist' directory.";
