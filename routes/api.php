<?php

use App\Http\Controllers\Api\AdminSubscriptionController;
use App\Http\Controllers\Api\AgentChatController;
use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoadmapController;
use App\Http\Controllers\Api\WebClientController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for the Rafi9i application.
| These routes are loaded within the "api" middleware group and are
| prefixed with /api automatically.
|
*/

// Health Check Endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'version' => app()->version(),
        'time' => now()->toIso8601String(),
    ]);
});

// Authentication Routes
$registerAuthRoutes = function () {
    // Public routes with brute-force rate limiting (5 attempts/min)
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // Private routes protected by Laravel Sanctum token
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/user', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
    });
};

Route::prefix('v1/auth')->group($registerAuthRoutes);
Route::prefix('auth')->group($registerAuthRoutes);

// Career Assessment Routes
$registerAssessmentRoutes = function () {
    // Public questions endpoint
    Route::get('/questions', [AssessmentController::class, 'questions']);

    // Protected assessment attempt endpoints
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/start', [AssessmentController::class, 'start']);
        Route::get('/attempts/active', [AssessmentController::class, 'active']);
        Route::get('/attempts', [AssessmentController::class, 'myAttempts']);
        Route::get('/attempts/{attempt}', [AssessmentController::class, 'show']);
        Route::get('/attempts/{attempt}/resume', [AssessmentController::class, 'resume']);
        Route::post('/attempts/{attempt}/answers', [AssessmentController::class, 'saveAnswer']);
        Route::post('/attempts/{attempt}/answers/batch', [AssessmentController::class, 'saveAnswersBatch']);
        Route::post('/attempts/{attempt}/submit', [AssessmentController::class, 'submit']);

        // Detailed orientation results & soft skills
        Route::get('/results/latest', [AssessmentController::class, 'latestResults']);
        Route::get('/results/{result}', [AssessmentController::class, 'showResult']);
        Route::get('/results/{result}/soft-skills', [AssessmentController::class, 'softSkills']);
        Route::get('/attempts/{attempt}/results', [AssessmentController::class, 'attemptResults']);
        Route::get('/attempts/{attempt}/soft-skills', [AssessmentController::class, 'attemptSoftSkills']);

        // AI-powered insights enrichment (Rate-limited: 10/min)
        Route::post('/results/{result}/ai-insights', [AssessmentController::class, 'refreshAiInsights'])
            ->middleware('throttle:ai');
    });
};

Route::prefix('v1/assessments')->group($registerAssessmentRoutes);
Route::prefix('assessments')->group($registerAssessmentRoutes);

// Career Roadmap Routes
$registerRoadmapRoutes = function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/', [RoadmapController::class, 'index']);
        Route::post('/generate', [RoadmapController::class, 'generate'])->middleware('throttle:ai');

        // Task progress & status updates
        Route::post('/tasks/{task}/progress', [RoadmapController::class, 'updateTaskProgress']);
        Route::post('/tasks/{task}/complete', [RoadmapController::class, 'markTaskComplete']);
        Route::post('/tasks/{task}/incomplete', [RoadmapController::class, 'markTaskIncomplete']);
        Route::post('/tasks/{task}/toggle', [RoadmapController::class, 'toggleTaskStatus']);

        // Specific roadmap details & progress
        Route::get('/{roadmap}', [RoadmapController::class, 'show']);
        Route::get('/{roadmap}/progress', [RoadmapController::class, 'progress']);
    });
};

Route::prefix('v1/roadmaps')->group($registerRoadmapRoutes);
Route::prefix('roadmaps')->group($registerRoadmapRoutes);

// Admin Subscription Management Routes (Secure verification & activation)
$registerAdminRoutes = function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/subscriptions', [AdminSubscriptionController::class, 'index']);
        Route::post('/users/{user}/activate-premium', [AdminSubscriptionController::class, 'activate']);
        Route::post('/users/{user}/deactivate-premium', [AdminSubscriptionController::class, 'deactivate']);
    });
};

Route::prefix('v1/admin')->group($registerAdminRoutes);
Route::prefix('admin')->group($registerAdminRoutes);

// Next.js Web Client Integration Routes
$registerWebClientRoutes = function () {
    Route::middleware('auth:sanctum')->group(function () {
        // Profile
        Route::get('/profile', [WebClientController::class, 'getProfile']);
        Route::match(['put', 'patch'], '/profile', [WebClientController::class, 'updateProfile']);

        // Basic & Advanced Moroccan Assessments
        Route::post('/assessments/basic/start', [WebClientController::class, 'startBasic']);
        Route::post('/assessments/basic/submit', [WebClientController::class, 'submitBasic']);
        Route::post('/assessments/advanced/start', [WebClientController::class, 'startAdvanced']);
        Route::post('/assessments/advanced/submit', [WebClientController::class, 'submitAdvanced']);

        // Results
        Route::get('/results/latest', [WebClientController::class, 'latestResult']);

        // Trial & Subscriptions
        Route::post('/trial/start', [WebClientController::class, 'startTrial']);
        Route::get('/trial/status', [WebClientController::class, 'getTrialStatus']);

        // Dashboard
        Route::get('/dashboard', [WebClientController::class, 'getDashboard']);

        // Resource & Roadmap Progress
        Route::patch('/progress/resource/{id}', [WebClientController::class, 'updateResourceProgress']);
        Route::patch('/progress/roadmap/{id}', [WebClientController::class, 'updateRoadmapProgress']);
    });
};

Route::prefix('v1')->group($registerWebClientRoutes);
Route::group([], $registerWebClientRoutes);

// Rafi AI Agent Chat Routes (Public & authenticated)
Route::post('/v1/agent/chat', [AgentChatController::class, 'chat'])->middleware('throttle:ai');
Route::post('/agent/chat', [AgentChatController::class, 'chat'])->middleware('throttle:ai');
