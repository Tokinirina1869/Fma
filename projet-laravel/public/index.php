<?php

// public/index.php
// ✅ CORS headers ajoutés AVANT que Laravel démarre
// Cela bypass tous les problèmes de middleware sur Render

$allowedOrigins = [
    'https://fma-six.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$isAllowed = in_array($origin, $allowedOrigins)
    || (bool) preg_match('#^https://fma.*\.vercel\.app$#', $origin);

if ($isAllowed) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
    header("Access-Control-Allow-Credentials: false");
    header("Access-Control-Max-Age: 86400");
}

// Répondre immédiatement aux requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// ════════════════════════════════════════════════════════
// Le reste est le contenu original de public/index.php
// NE PAS MODIFIER CE QUI SUIT
// ════════════════════════════════════════════════════════

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);