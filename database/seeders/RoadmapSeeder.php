<?php

namespace Database\Seeders;

use App\Models\CareerPath;
use App\Models\ProgressTracking;
use App\Models\Roadmap;
use App\Models\RoadmapTask;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoadmapSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $student = User::where('email', 'student@rafi9i.com')->first();
        $career = CareerPath::where('slug', 'full-stack-software-engineer')->first();

        if (! $student || ! $career) {
            return;
        }

        // 1. Create Roadmap
        $roadmap = Roadmap::updateOrCreate(
            [
                'user_id' => $student->id,
                'career_path_id' => $career->id,
            ],
            [
                'title' => 'Full Stack Developer Career Acceleration Roadmap',
                'description' => 'A structured 12-week intensive pathway taking you from core relational database modeling to modern React 19 and Laravel 13 full stack production mastery.',
                'duration_weeks' => 12,
                'difficulty_level' => 'intermediate',
                'status' => 'active',
                'metadata' => [
                    'target_completion_date' => now()->addWeeks(10)->toDateString(),
                    'weekly_commitment_hours' => 15,
                    'mentor_assigned' => 'Dr. Sara El Idrissi',
                ],
            ]
        );

        // 2. Create Roadmap Tasks across 3 Phases
        $tasksData = [
            // Phase 1
            [
                'title' => 'Relational Database Schema Design & Normalization',
                'description' => 'Design production-grade MySQL schemas with third normal form, proper foreign keys, cascade deletes, composite indexes, and transaction safety.',
                'stage' => 'Phase 1: Database & Backend Foundations',
                'order' => 1,
                'estimated_hours' => 8,
                'resource_links' => [
                    ['title' => 'Laravel Migrations & Schema Docs', 'url' => 'https://laravel.com/docs/migrations', 'type' => 'documentation'],
                    ['title' => 'Database Indexing Explained', 'url' => 'https://use-the-index-luke.com/', 'type' => 'guide'],
                ],
                'skills_covered' => ['MySQL', 'Database Design', 'Indexing', 'Migrations'],
                'progress_status' => 'completed',
                'time_spent' => 480,
                'notes' => 'Completed all schema design exercises, tested foreign keys and composite indexes in MySQL.',
                'completed_at' => now()->subDays(12),
            ],
            [
                'title' => 'RESTful API Architecture & Standard Envelopes in Laravel',
                'description' => 'Build clean controller layers extending BaseApiController with uniform JSON responses, status codes, and exception rendering.',
                'stage' => 'Phase 1: Database & Backend Foundations',
                'order' => 2,
                'estimated_hours' => 10,
                'resource_links' => [
                    ['title' => 'Laravel Routing & Controllers', 'url' => 'https://laravel.com/docs/controllers', 'type' => 'documentation'],
                    ['title' => 'HTTP API Design Best Practices', 'url' => 'https://restfulapi.net/', 'type' => 'article'],
                ],
                'skills_covered' => ['PHP 8.4', 'Laravel Controllers', 'REST APIs', 'JSON Responses'],
                'progress_status' => 'completed',
                'time_spent' => 600,
                'notes' => 'Implemented BaseApiController with success/error helper envelopes.',
                'completed_at' => now()->subDays(7),
            ],
            [
                'title' => 'Eloquent ORM Relationships & Eager Loading',
                'description' => 'Master hasOne, hasMany, belongsTo, and many-to-many relationships while preventing N+1 query performance regressions with eager loading.',
                'stage' => 'Phase 1: Database & Backend Foundations',
                'order' => 3,
                'estimated_hours' => 12,
                'resource_links' => [
                    ['title' => 'Eloquent Relationships Guide', 'url' => 'https://laravel.com/docs/eloquent-relationships', 'type' => 'documentation'],
                ],
                'skills_covered' => ['Eloquent ORM', 'Query Optimization', 'Eager Loading'],
                'progress_status' => 'completed',
                'time_spent' => 720,
                'notes' => 'Tested all models and verified queries with tinker.',
                'completed_at' => now()->subDays(2),
            ],

            // Phase 2
            [
                'title' => 'React 19 State Management & Vite Frontend Integration',
                'description' => 'Integrate the React 19 frontend with the Laravel API. Handle CORS, preflight options, asynchronous fetch/axios services, and custom loading/error states.',
                'stage' => 'Phase 2: Modern Frontend & API Integration',
                'order' => 4,
                'estimated_hours' => 14,
                'resource_links' => [
                    ['title' => 'React 19 Official Documentation', 'url' => 'https://react.dev/', 'type' => 'documentation'],
                    ['title' => 'Vite Guide', 'url' => 'https://vite.dev/guide/', 'type' => 'guide'],
                ],
                'skills_covered' => ['React 19', 'Vite', 'State Management', 'Fetch API', 'CORS'],
                'progress_status' => 'in_progress',
                'time_spent' => 240,
                'notes' => 'Configured CORS on Laravel backend and connected the frontend test client.',
                'completed_at' => null,
            ],
            [
                'title' => 'Form Validation & Form Requests in Laravel',
                'description' => 'Implement dedicated FormRequest classes to strictly validate input payloads, sanitize data, and return standardized 422 Unprocessable Entity responses.',
                'stage' => 'Phase 2: Modern Frontend & API Integration',
                'order' => 5,
                'estimated_hours' => 8,
                'resource_links' => [
                    ['title' => 'Laravel Validation Documentation', 'url' => 'https://laravel.com/docs/validation', 'type' => 'documentation'],
                ],
                'skills_covered' => ['FormRequests', 'Input Sanitization', 'Error Handling'],
                'progress_status' => 'pending',
                'time_spent' => 0,
                'notes' => null,
                'completed_at' => null,
            ],
            [
                'title' => 'Authentication with Laravel Sanctum & Protected Routes',
                'description' => 'Implement stateful token and cookie-based authentication, CSRF protection, and protect sensitive career roadmap and assessment endpoints.',
                'stage' => 'Phase 2: Modern Frontend & API Integration',
                'order' => 6,
                'estimated_hours' => 12,
                'resource_links' => [
                    ['title' => 'Laravel Sanctum Documentation', 'url' => 'https://laravel.com/docs/sanctum', 'type' => 'documentation'],
                ],
                'skills_covered' => ['Sanctum', 'Bearer Tokens', 'CSRF', 'Route Guards'],
                'progress_status' => 'pending',
                'time_spent' => 0,
                'notes' => null,
                'completed_at' => null,
            ],

            // Phase 3
            [
                'title' => 'AI Career Guidance Engine & Recommendation Pipeline',
                'description' => 'Implement the scoring algorithm calculating career match percentages and integrating OpenAI/Claude API to generate personalized career orientation advice.',
                'stage' => 'Phase 3: Deployment, DevOps & Portfolio Capstone',
                'order' => 7,
                'estimated_hours' => 16,
                'resource_links' => [
                    ['title' => 'OpenAI PHP Client', 'url' => 'https://github.com/openai-php/client', 'type' => 'repository'],
                ],
                'skills_covered' => ['AI Integration', 'Recommendation Engines', 'JSON Prompts'],
                'progress_status' => 'pending',
                'time_spent' => 0,
                'notes' => null,
                'completed_at' => null,
            ],
            [
                'title' => 'Automated Testing with Pest & PHPUnit',
                'description' => 'Write feature and unit tests for authentication, assessment submission, roadmap generation, and task progress updating.',
                'stage' => 'Phase 3: Deployment, DevOps & Portfolio Capstone',
                'order' => 8,
                'estimated_hours' => 10,
                'resource_links' => [
                    ['title' => 'PHPUnit in Laravel', 'url' => 'https://laravel.com/docs/testing', 'type' => 'documentation'],
                ],
                'skills_covered' => ['PHPUnit', 'Feature Testing', 'Database Assertions'],
                'progress_status' => 'pending',
                'time_spent' => 0,
                'notes' => null,
                'completed_at' => null,
            ],
            [
                'title' => 'Production Deployment & Continuous Integration',
                'description' => 'Deploy the Rafi9i application on a cloud Linux server with Nginx, MySQL, SSL certificates, and automated GitHub Actions CI/CD.',
                'stage' => 'Phase 3: Deployment, DevOps & Portfolio Capstone',
                'order' => 9,
                'estimated_hours' => 12,
                'resource_links' => [
                    ['title' => 'Laravel Deployment Best Practices', 'url' => 'https://laravel.com/docs/deployment', 'type' => 'documentation'],
                ],
                'skills_covered' => ['CI/CD', 'Docker', 'Nginx', 'SSL', 'Production Tuning'],
                'progress_status' => 'pending',
                'time_spent' => 0,
                'notes' => null,
                'completed_at' => null,
            ],
        ];

        foreach ($tasksData as $data) {
            $task = RoadmapTask::updateOrCreate(
                [
                    'roadmap_id' => $roadmap->id,
                    'stage' => $data['stage'],
                    'order' => $data['order'],
                ],
                [
                    'title' => $data['title'],
                    'description' => $data['description'],
                    'estimated_hours' => $data['estimated_hours'],
                    'resource_links' => $data['resource_links'],
                    'skills_covered' => $data['skills_covered'],
                ]
            );

            // 3. Create ProgressTracking for the student
            ProgressTracking::updateOrCreate(
                [
                    'user_id' => $student->id,
                    'roadmap_task_id' => $task->id,
                ],
                [
                    'status' => $data['progress_status'],
                    'started_at' => $data['progress_status'] !== 'pending' ? now()->subDays(14) : null,
                    'completed_at' => $data['completed_at'],
                    'notes' => $data['notes'],
                    'time_spent_minutes' => $data['time_spent'],
                ]
            );
        }
    }
}
