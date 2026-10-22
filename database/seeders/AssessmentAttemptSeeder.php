<?php

namespace Database\Seeders;

use App\Models\AssessmentAnswer;
use App\Models\AssessmentAttempt;
use App\Models\AssessmentQuestion;
use App\Models\CareerPath;
use App\Models\OrientationResult;
use App\Models\User;
use Illuminate\Database\Seeder;

class AssessmentAttemptSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $student = User::where('email', 'student@rafi9i.com')->first();
        if (! $student) {
            return;
        }

        $questions = AssessmentQuestion::active()->ordered()->get();
        if ($questions->isEmpty()) {
            return;
        }

        // 1. Create a completed assessment attempt
        $attempt = AssessmentAttempt::updateOrCreate(
            [
                'user_id' => $student->id,
                'status' => 'completed',
            ],
            [
                'started_at' => now()->subHours(2),
                'completed_at' => now()->subHours(1)->subMinutes(35),
                'total_score' => 91.50,
                'metadata' => [
                    'duration_minutes' => 25,
                    'trait_scores' => [
                        'software_development' => 95,
                        'ai_ml' => 88,
                        'devops' => 80,
                        'design' => 65,
                        'security' => 70,
                        'data_analysis' => 75,
                    ],
                    'confidence_index' => 'high',
                ],
            ]
        );

        // 2. Seed answers for each question
        $answerChoices = [
            1 => ['option' => 'build', 'score' => 5.0, 'note' => 'I love creating apps end-to-end.'],
            2 => ['option' => 'full_stack', 'score' => 5.0, 'note' => 'Iterative coding works best for me.'],
            3 => ['option' => 'full_stack_feature', 'score' => 5.0, 'note' => 'Connecting frontend and backend feels magic.'],
            4 => ['option' => 'page_speed', 'score' => 4.5, 'note' => 'Efficiency and architecture matter.'],
            5 => ['option' => 'prefer_logic', 'score' => 5.0, 'note' => 'System design and object modeling are my strength.'],
            6 => ['option' => 'agile_squad', 'score' => 4.0, 'note' => 'Collaboration with rapid feedback loops.'],
            7 => ['option' => 'gen_ai', 'score' => 5.0, 'note' => 'AI integrated into web applications is the future.'],
            8 => ['option' => 'saas_app', 'score' => 5.0, 'note' => 'I already build full web apps on weekends.'],
        ];

        foreach ($questions as $q) {
            $choice = $answerChoices[$q->order] ?? ['option' => $q->options[0]['value'], 'score' => 4.0, 'note' => null];

            AssessmentAnswer::updateOrCreate(
                [
                    'assessment_attempt_id' => $attempt->id,
                    'assessment_question_id' => $q->id,
                ],
                [
                    'selected_option' => $choice['option'],
                    'answer_text' => $choice['note'],
                    'score' => $choice['score'],
                ]
            );
        }

        // 3. Create orientation results matching top career paths
        $fullStack = CareerPath::where('slug', 'full-stack-software-engineer')->first();
        $aiEng = CareerPath::where('slug', 'ai-machine-learning-engineer')->first();
        $devops = CareerPath::where('slug', 'cloud-devops-engineer')->first();

        if ($fullStack) {
            OrientationResult::updateOrCreate(
                [
                    'assessment_attempt_id' => $attempt->id,
                    'career_path_id' => $fullStack->id,
                ],
                [
                    'user_id' => $student->id,
                    'match_percentage' => 94.50,
                    'ranking' => 1,
                    'ai_analysis' => 'Amine demonstrates an exceptional aptitude for full-stack application development. His responses show strong enthusiasm for building complete web apps with React and Laravel, high attention to API architectures, and strong problem-solving skills.',
                    'strengths' => [
                        'End-to-end full stack architecture',
                        'Relational database design (MySQL/PostgreSQL)',
                        'RESTful API design and state management',
                        'Rapid prototyping and iterative delivery',
                    ],
                    'growth_areas' => [
                        'Automated integration and end-to-end testing',
                        'Containerization and production Docker deployments',
                        'Advanced caching strategies (Redis/Memcached)',
                    ],
                    'recommendations' => [
                        'Master building decoupled SPAs with React 19 and Laravel 13',
                        'Implement Sanctum authentication and role-based permissions',
                        'Deploy a live capstone portfolio project on a VPS with automated CI/CD',
                    ],
                ]
            );
        }

        if ($aiEng) {
            OrientationResult::updateOrCreate(
                [
                    'assessment_attempt_id' => $attempt->id,
                    'career_path_id' => $aiEng->id,
                ],
                [
                    'user_id' => $student->id,
                    'match_percentage' => 88.00,
                    'ranking' => 2,
                    'ai_analysis' => 'High curiosity in generative AI tools and intelligent agents. Combining full-stack foundation with LLM APIs and embeddings makes Amine a strong candidate for AI Application Engineering roles.',
                    'strengths' => [
                        'Algorithmic reasoning',
                        'Interest in LLMs and AI agent workflows',
                        'Quick adoption of modern SDKs',
                    ],
                    'growth_areas' => [
                        'Vector databases and RAG architectures',
                        'Mathematical foundations of gradient descent & transformers',
                    ],
                    'recommendations' => [
                        'Build an AI-powered feature in your web apps (e.g. smart career advisor bot)',
                        'Explore LangChain / LlamaIndex and vector indexing with pgvector/Pinecone',
                    ],
                ]
            );
        }

        if ($devops) {
            OrientationResult::updateOrCreate(
                [
                    'assessment_attempt_id' => $attempt->id,
                    'career_path_id' => $devops->id,
                ],
                [
                    'user_id' => $student->id,
                    'match_percentage' => 81.50,
                    'ranking' => 3,
                    'ai_analysis' => 'Good interest in reliable systems, server response times, and self-hosting. A natural secondary skill set that boosts full stack engineering value.',
                    'strengths' => [
                        'System efficiency awareness',
                        'Appreciation for automated workflows',
                    ],
                    'growth_areas' => [
                        'Kubernetes orchestration',
                        'Terraform infrastructure-as-code',
                    ],
                    'recommendations' => [
                        'Set up GitHub Actions to run tests and deploy on pull requests',
                        'Containerize your Laravel and React projects using multi-stage Dockerfiles',
                    ],
                ]
            );
        }
    }
}
