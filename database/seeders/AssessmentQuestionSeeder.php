<?php

namespace Database\Seeders;

use App\Models\AssessmentQuestion;
use Illuminate\Database\Seeder;

class AssessmentQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questions = [
            [
                'question_text' => 'When faced with a brand-new project, which phase excites you the most?',
                'category' => 'work_style',
                'question_type' => 'single_choice',
                'weight' => 1.5,
                'order' => 1,
                'is_active' => true,
                'options' => [
                    ['value' => 'build', 'label' => 'Writing code and building functional software features from scratch', 'trait' => 'software_development', 'score' => 5],
                    ['value' => 'design', 'label' => 'Sketching wireframes, user journeys, and visual UI layouts', 'trait' => 'design', 'score' => 5],
                    ['value' => 'analyze', 'label' => 'Analyzing existing data metrics to uncover hidden patterns and trends', 'trait' => 'data_analysis', 'score' => 5],
                    ['value' => 'secure', 'label' => 'Auditing the system architecture for potential security flaws and vulnerabilities', 'trait' => 'security', 'score' => 5],
                ],
            ],
            [
                'question_text' => 'How do you prefer to approach complex problem-solving?',
                'category' => 'analytical',
                'question_type' => 'single_choice',
                'weight' => 2.0,
                'order' => 2,
                'is_active' => true,
                'options' => [
                    ['value' => 'algorithms', 'label' => 'Breaking the problem down into logical steps and mathematical algorithms', 'trait' => 'ai_ml', 'score' => 5],
                    ['value' => 'full_stack', 'label' => 'Prototyping an interactive working demo quickly to test assumptions', 'trait' => 'software_development', 'score' => 5],
                    ['value' => 'automation', 'label' => 'Creating automated workflows, scripts, and repeatable pipeline tools', 'trait' => 'devops', 'score' => 5],
                    ['value' => 'user_interviews', 'label' => 'Talking directly to users to understand their pain points and psychological triggers', 'trait' => 'design', 'score' => 5],
                ],
            ],
            [
                'question_text' => 'Which type of technical challenge feels most rewarding to you?',
                'category' => 'technical_aptitude',
                'question_type' => 'single_choice',
                'weight' => 2.0,
                'order' => 3,
                'is_active' => true,
                'options' => [
                    ['value' => 'full_stack_feature', 'label' => 'Connecting a React UI with a Laravel REST API and MySQL database', 'trait' => 'software_development', 'score' => 5],
                    ['value' => 'machine_learning', 'label' => 'Training a machine learning model and improving its prediction accuracy', 'trait' => 'ai_ml', 'score' => 5],
                    ['value' => 'cloud_scale', 'label' => 'Configuring auto-scaling Kubernetes clusters and high-uptime cloud hosting', 'trait' => 'devops', 'score' => 5],
                    ['value' => 'threat_detection', 'label' => 'Simulating cyber attacks (ethical hacking) and locking down network firewalls', 'trait' => 'security', 'score' => 5],
                ],
            ],
            [
                'question_text' => 'When looking at a website or application, what is the first thing you notice?',
                'category' => 'creative',
                'question_type' => 'single_choice',
                'weight' => 1.5,
                'order' => 4,
                'is_active' => true,
                'options' => [
                    ['value' => 'visual_polish', 'label' => 'Visual hierarchy, typography, color harmony, and micro-animations', 'trait' => 'design', 'score' => 5],
                    ['value' => 'page_speed', 'label' => 'Load speed, server response times, and overall technical responsiveness', 'trait' => 'software_development', 'score' => 5],
                    ['value' => 'data_usage', 'label' => 'What telemetry, analytics, and personalization algorithms are running in the background', 'trait' => 'data_analysis', 'score' => 5],
                    ['value' => 'security_posture', 'label' => 'SSL certificates, authentication flow, and data protection privacy policies', 'trait' => 'security', 'score' => 5],
                ],
            ],
            [
                'question_text' => 'How do you feel about working with large datasets, statistics, and probabilities?',
                'category' => 'analytical',
                'question_type' => 'single_choice',
                'weight' => 1.5,
                'order' => 5,
                'is_active' => true,
                'options' => [
                    ['value' => 'love_math', 'label' => 'I love mathematical modeling, regression analysis, and neural networks', 'trait' => 'ai_ml', 'score' => 5],
                    ['value' => 'insights_viz', 'label' => 'I enjoy creating interactive charts and translating numbers into executive stories', 'trait' => 'data_analysis', 'score' => 5],
                    ['value' => 'prefer_logic', 'label' => 'I prefer discrete system logic, application state, and object-oriented architecture', 'trait' => 'software_development', 'score' => 5],
                    ['value' => 'prefer_empathy', 'label' => 'I prefer qualitative empathy research and human behavior over pure numbers', 'trait' => 'design', 'score' => 5],
                ],
            ],
            [
                'question_text' => 'What is your preferred balance between solo deep-work and cross-functional collaboration?',
                'category' => 'collaboration',
                'question_type' => 'single_choice',
                'weight' => 1.0,
                'order' => 6,
                'is_active' => true,
                'options' => [
                    ['value' => 'agile_squad', 'label' => 'Fast-paced agile software sprints with daily standups and code reviews', 'trait' => 'software_development', 'score' => 4],
                    ['value' => 'user_workshops', 'label' => 'Leading design thinking workshops, user feedback sessions, and stakeholder reviews', 'trait' => 'design', 'score' => 4],
                    ['value' => 'operations_guard', 'label' => 'Supporting development squads with resilient shared platforms and 24/7 reliability', 'trait' => 'devops', 'score' => 4],
                    ['value' => 'deep_research', 'label' => 'Prolonged periods of focused experimentation and paper research', 'trait' => 'ai_ml', 'score' => 4],
                ],
            ],
            [
                'question_text' => 'Which emerging technological trend intrigues you the most right now?',
                'category' => 'vision',
                'question_type' => 'single_choice',
                'weight' => 1.5,
                'order' => 7,
                'is_active' => true,
                'options' => [
                    ['value' => 'gen_ai', 'label' => 'Autonomous AI agents, Large Language Models, and Multimodal reasoning', 'trait' => 'ai_ml', 'score' => 5],
                    ['value' => 'modern_web', 'label' => 'High-performance reactive web frameworks, serverless, and edge computing', 'trait' => 'software_development', 'score' => 5],
                    ['value' => 'zero_trust', 'label' => 'Zero-trust security architectures, quantum cryptography, and cyber defense', 'trait' => 'security', 'score' => 5],
                    ['value' => 'cloud_native', 'label' => 'Kubernetes service meshes, GitOps automation, and hybrid cloud orchestration', 'trait' => 'devops', 'score' => 5],
                ],
            ],
            [
                'question_text' => 'If you had a free weekend to complete a side project, what would you build?',
                'category' => 'passion',
                'question_type' => 'single_choice',
                'weight' => 2.0,
                'order' => 8,
                'is_active' => true,
                'options' => [
                    ['value' => 'saas_app', 'label' => 'A complete SaaS web app with user authentication, dashboard, and database backend', 'trait' => 'software_development', 'score' => 5],
                    ['value' => 'ai_bot', 'label' => 'A personalized AI recommendation assistant powered by embeddings and vector search', 'trait' => 'ai_ml', 'score' => 5],
                    ['value' => 'design_system', 'label' => 'A comprehensive Figma design UI kit with accessible components and prototypes', 'trait' => 'design', 'score' => 5],
                    ['value' => 'home_lab', 'label' => 'A self-hosted home server with automated Docker containers and reverse proxy', 'trait' => 'devops', 'score' => 5],
                ],
            ],
        ];

        foreach ($questions as $q) {
            AssessmentQuestion::updateOrCreate(
                ['question_text' => $q['question_text']],
                $q
            );
        }
    }
}
