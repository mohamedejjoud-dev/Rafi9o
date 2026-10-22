<?php

namespace App\Services;

use App\Models\AssessmentAttempt;
use App\Models\CareerPath;
use App\Models\OrientationResult;
use App\Models\ProgressTracking;
use App\Models\Roadmap;
use App\Models\RoadmapTask;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CareerAssessmentService
{
    public function __construct(
        protected OpenRouterService $openRouter
    ) {}

    /**
     * Trait definitions and default weights for matching career paths.
     *
     * @var array<string, array<string, float>>
     */
    protected array $careerTraitWeights = [
        'full-stack-software-engineer' => [
            'software_development' => 0.65,
            'devops' => 0.15,
            'design' => 0.10,
            'data_analysis' => 0.10,
        ],
        'ai-machine-learning-engineer' => [
            'ai_ml' => 0.65,
            'software_development' => 0.20,
            'data_analysis' => 0.15,
        ],
        'cloud-devops-engineer' => [
            'devops' => 0.65,
            'security' => 0.20,
            'software_development' => 0.15,
        ],
        'ui-ux-product-designer' => [
            'design' => 0.70,
            'software_development' => 0.15,
            'data_analysis' => 0.15,
        ],
        'cybersecurity-analyst' => [
            'security' => 0.65,
            'devops' => 0.20,
            'software_development' => 0.15,
        ],
        'data-analyst-bi-specialist' => [
            'data_analysis' => 0.65,
            'ai_ml' => 0.20,
            'software_development' => 0.15,
        ],
    ];

    /**
     * Complete an assessment attempt and generate career orientation matches.
     * Note: Career path scoring and ranking remains strictly deterministic.
     */
    public function completeAttempt(AssessmentAttempt $attempt): AssessmentAttempt
    {
        return DB::transaction(function () use ($attempt) {
            $attempt->loadMissing(['answers.question', 'user.profile']);

            // 1. Calculate scores per trait (Deterministic)
            $traitScores = $this->calculateTraitScores($attempt);

            // 2. Calculate average total score across answers (Deterministic)
            $avgScore = $attempt->answers->avg('score') ?: 0;
            $normalizedTotalScore = round(($avgScore / 5.0) * 100, 2);

            // 3. Mark attempt as completed
            $attempt->update([
                'status' => 'completed',
                'completed_at' => now(),
                'total_score' => $normalizedTotalScore,
                'metadata' => array_merge($attempt->metadata ?? [], [
                    'trait_scores' => $traitScores,
                    'answers_count' => $attempt->answers->count(),
                    'scored_at' => now()->toIso8601String(),
                ]),
            ]);

            // 4. Generate & store ranked orientation results
            $this->generateOrientationResults($attempt, $traitScores);

            return $attempt->fresh(['answers.question', 'orientationResults.careerPath']);
        });
    }

    /**
     * Calculate 0-100 normalized scores for each trait from submitted answers.
     *
     * @return array<string, float>
     */
    public function calculateTraitScores(AssessmentAttempt $attempt): array
    {
        $traitTotals = [];
        $traitMaxes = [];

        foreach ($attempt->answers as $answer) {
            $question = $answer->question;
            if (! $question) {
                continue;
            }

            $options = collect($question->options ?? []);
            $selected = $options->firstWhere('value', $answer->selected_option);

            if (! $selected) {
                continue;
            }

            $trait = $selected['trait'] ?? 'general';
            $score = (float) ($selected['score'] ?? 3);
            $weight = (float) ($question->weight ?? 1.0);

            $traitTotals[$trait] = ($traitTotals[$trait] ?? 0) + ($score * $weight);
            $traitMaxes[$trait] = ($traitMaxes[$trait] ?? 0) + (5.0 * $weight);
        }

        $normalized = [];
        foreach ($traitMaxes as $trait => $max) {
            $normalized[$trait] = $max > 0 ? round(($traitTotals[$trait] / $max) * 100, 1) : 50.0;
        }

        return $normalized;
    }

    /**
     * Generate orientation results for active career paths based on trait scores.
     * Ranking and match percentages are purely deterministic.
     * OpenRouter AI is optionally used to personalize the explanation and recommendations.
     */
    protected function generateOrientationResults(AssessmentAttempt $attempt, array $traitScores): Collection
    {
        // Remove prior results if any
        $attempt->orientationResults()->delete();

        $careerPaths = CareerPath::active()->get();
        $matches = [];

        foreach ($careerPaths as $path) {
            $weights = $this->careerTraitWeights[$path->slug] ?? ['software_development' => 1.0];
            $weightedScore = 0;
            $totalWeight = 0;

            foreach ($weights as $trait => $w) {
                $score = $traitScores[$trait] ?? 50.0;
                $weightedScore += ($score * $w);
                $totalWeight += $w;
            }

            $percentage = $totalWeight > 0 ? round($weightedScore / $totalWeight, 2) : 50.0;
            // Bound between 35% and 98%
            $percentage = max(35.0, min(98.5, $percentage));

            $matches[] = [
                'path' => $path,
                'match_percentage' => $percentage,
            ];
        }

        // Sort descending by match percentage (Purely deterministic)
        usort($matches, fn ($a, $b) => $b['match_percentage'] <=> $a['match_percentage']);

        $results = collect();
        $rank = 1;

        // Save top 3 recommendations
        foreach (array_slice($matches, 0, 3) as $match) {
            $path = $match['path'];
            $pct = $match['match_percentage'];

            // Deterministic baseline insights
            $insights = $this->buildCareerInsights($path, $pct);

            // Enrich top match with OpenRouter AI if configured and available
            if ($rank === 1 && $this->openRouter->isConfigured()) {
                $aiInsights = $this->openRouter->explainCareerMatch(
                    $attempt->user,
                    $path,
                    $pct,
                    $traitScores
                );

                if ($aiInsights && ! empty($aiInsights['analysis'])) {
                    $insights = $aiInsights;
                }
            }

            $result = OrientationResult::create([
                'assessment_attempt_id' => $attempt->id,
                'user_id' => $attempt->user_id,
                'career_path_id' => $path->id,
                'match_percentage' => $pct,
                'ranking' => $rank++,
                'ai_analysis' => $insights['analysis'],
                'strengths' => $insights['strengths'],
                'growth_areas' => $insights['growth_areas'],
                'recommendations' => $insights['recommendations'],
            ]);

            $results->push($result);
        }

        return $results;
    }

    /**
     * Request an updated AI explanation for an existing orientation result.
     */
    public function refreshAiExplanation(OrientationResult $result): OrientationResult
    {
        $result->loadMissing(['user.profile', 'careerPath', 'attempt']);

        $traitScores = $result->attempt?->metadata['trait_scores'] ?? [];

        $aiInsights = $this->openRouter->explainCareerMatch(
            $result->user,
            $result->careerPath,
            (float) $result->match_percentage,
            $traitScores
        );

        if ($aiInsights && ! empty($aiInsights['analysis'])) {
            $result->update([
                'ai_analysis' => $aiInsights['analysis'],
                'strengths' => $aiInsights['strengths'] ?? $result->strengths,
                'growth_areas' => $aiInsights['growth_areas'] ?? $result->growth_areas,
                'recommendations' => $aiInsights['recommendations'] ?? $result->recommendations,
            ]);
        }

        return $result->fresh(['careerPath']);
    }

    /**
     * Create or personalize a development roadmap for a user and career path.
     * Uses OpenRouter AI when available (cached to prevent duplicate requests), or falls back to a 30-day weekly milestone curriculum.
     *
     * @param  array<string, mixed>  $options
     */
    public function createPersonalizedRoadmap(User $user, CareerPath $careerPath, array $options = []): Roadmap
    {
        return DB::transaction(function () use ($user, $careerPath, $options) {
            $user->loadMissing('profile');

            $forceRegenerate = (bool) ($options['force_regenerate'] ?? false);
            $durationDays = (int) ($options['duration_days'] ?? 30);
            $defaultWeeks = (int) ($options['duration_weeks'] ?? (isset($options['duration_days']) ? (int) round($options['duration_days'] / 7) : 4)); // 4 weeks for 30 days

            // 1. Prevent duplicate AI requests using Cache
            $cacheKey = "ai_roadmap_{$user->id}_{$careerPath->id}_".md5(json_encode([
                'career_goals' => $options['career_goals'] ?? null,
                'focus_areas' => $options['focus_areas'] ?? [],
                'target_hours_per_week' => $options['target_hours_per_week'] ?? 10,
                'duration_days' => $durationDays,
            ]));

            if ($forceRegenerate) {
                Cache::forget($cacheKey);
            }

            $aiData = null;
            if ($this->openRouter->isConfigured()) {
                $aiData = Cache::remember($cacheKey, now()->addHours(6), function () use ($user, $careerPath, $options) {
                    return $this->openRouter->generatePersonalizedRoadmap($user, $careerPath, $options);
                });
            }

            $title = $aiData['title'] ?? ($careerPath->title.' Personalized 30-Day Career Roadmap');
            $description = $aiData['description'] ?? ($careerPath->summary ?: 'Structured 30-day learning and execution pathway for '.$careerPath->title.'.');
            $durationWeeks = (int) ($aiData['duration_weeks'] ?? $defaultWeeks);
            $difficulty = $aiData['difficulty_level'] ?? $careerPath->difficulty_level;

            // 2. Create or update user's roadmap
            $roadmap = Roadmap::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'career_path_id' => $careerPath->id,
                ],
                [
                    'title' => $title,
                    'description' => $description,
                    'duration_weeks' => $durationWeeks,
                    'difficulty_level' => $difficulty,
                    'status' => 'active',
                    'metadata' => array_merge($options, [
                        'duration_days' => $durationDays,
                        'ai_generated' => $aiData !== null,
                        'generated_at' => now()->toIso8601String(),
                    ]),
                ]
            );

            // 3. Populate tasks if AI provided stages or populate deterministic 30-day weekly milestones
            if ($aiData && ! empty($aiData['stages'])) {
                // Remove old tasks to replace with fresh AI curriculum
                $roadmap->tasks()->delete();
                $order = 1;

                foreach ($aiData['stages'] as $stageGroup) {
                    $stageName = $stageGroup['stage'] ?? 'Week Milestone';
                    $tasks = $stageGroup['tasks'] ?? [];

                    foreach ($tasks as $taskItem) {
                        $task = RoadmapTask::create([
                            'roadmap_id' => $roadmap->id,
                            'title' => $taskItem['title'] ?? ('Task '.$order),
                            'description' => $taskItem['description'] ?? null,
                            'stage' => $stageName,
                            'order' => $order++,
                            'estimated_hours' => (int) ($taskItem['estimated_hours'] ?? 8),
                            'skills_covered' => $taskItem['skills_covered'] ?? [],
                            'resource_links' => $taskItem['resource_links'] ?? [],
                        ]);

                        ProgressTracking::updateOrCreate(
                            [
                                'user_id' => $user->id,
                                'roadmap_task_id' => $task->id,
                            ],
                            ['status' => 'pending']
                        );
                    }
                }
            } else {
                // Populate deterministic 30-day curriculum with 4 actionable weekly milestones
                $this->populateDefaultTasks($roadmap, $careerPath, $user, $options);
            }

            return $roadmap->load(['careerPath', 'tasks.progressTrackings']);
        });
    }

    /**
     * Populate deterministic 30-day actionable weekly milestones and tasks based on career path and assessment.
     *
     * @param  array<string, mixed>  $options
     */
    protected function populateDefaultTasks(Roadmap $roadmap, CareerPath $careerPath, User $user, array $options = []): void
    {
        // Clear previous tasks if regenerating
        $roadmap->tasks()->delete();

        $skills = $careerPath->required_skills ?? ['Core Foundations', 'Practical Projects', 'Portfolio Preparation'];
        $softSkills = $this->getSoftSkillsPriorities($careerPath);
        $topSoftSkills = array_column(array_slice($softSkills, 0, 4), 'skill');

        $milestones = [
            [
                'stage' => 'Week 1 (Days 1–7): Foundations & Assessment Gap Bridging',
                'tasks' => [
                    [
                        'title' => 'Development Setup & Diagnostic Skill Baseline',
                        'description' => 'Configure standard development environment, initialize Git repository with CI/CD conventions, and resolve baseline diagnostic challenges for '.$careerPath->title.'.',
                        'estimated_hours' => 6,
                        'skills_covered' => array_filter([$skills[0] ?? 'Foundations', 'Git & Version Control', $topSoftSkills[0] ?? 'Problem Solving']),
                        'resource_links' => [
                            ['title' => 'Environment Setup & Git Standards', 'url' => 'https://git-scm.com/book', 'type' => 'guide'],
                            ['title' => $careerPath->title.' Starter Documentation', 'url' => 'https://developer.mozilla.org/', 'type' => 'documentation'],
                        ],
                    ],
                    [
                        'title' => 'Core Architecture & Paradigm Mastery',
                        'description' => 'Implement foundational patterns, core language constructs, and data models matching industry standards in '.$careerPath->industry.'.',
                        'estimated_hours' => 8,
                        'skills_covered' => array_filter([$skills[1] ?? 'Core Stack', 'Software Design Patterns']),
                        'resource_links' => [
                            ['title' => 'Core Architecture Patterns', 'url' => 'https://refactoring.guru/design-patterns', 'type' => 'reference'],
                        ],
                    ],
                ],
            ],
            [
                'stage' => 'Week 2 (Days 8–14): Core Technical Competencies & Deep Dives',
                'tasks' => [
                    [
                        'title' => 'Core Business Domain Logic & Robust APIs',
                        'description' => 'Build structured business service layers, implement standard REST/data endpoints, validate inputs strictly, and handle edge-case exceptions.',
                        'estimated_hours' => 10,
                        'skills_covered' => array_filter([$skills[2] ?? 'API Architecture', $skills[3] ?? 'Database Design', $topSoftSkills[1] ?? 'Agile Task Decomposition']),
                        'resource_links' => [
                            ['title' => 'API Design & Validation Best Practices', 'url' => 'https://restfulapi.net/', 'type' => 'article'],
                        ],
                    ],
                    [
                        'title' => 'Automated Testing & Code Quality Assurance',
                        'description' => 'Author comprehensive unit and feature tests, mock external service integrations, and configure automated code formatting and static analysis.',
                        'estimated_hours' => 8,
                        'skills_covered' => ['Automated Testing', 'Test-Driven Development', 'Attention to Detail'],
                        'resource_links' => [
                            ['title' => 'Testing Best Practices & Mocking', 'url' => 'https://phpunit.de/', 'type' => 'documentation'],
                        ],
                    ],
                ],
            ],
            [
                'stage' => 'Week 3 (Days 15–21): Practical Architecture & Soft-Skills Mastery',
                'tasks' => [
                    [
                        'title' => 'Performance Optimization, Security Hardening & Caching',
                        'description' => 'Profile query execution, apply index optimizations, implement distributed rate-limiting, and address OWASP Top 10 security guidelines.',
                        'estimated_hours' => 10,
                        'skills_covered' => array_filter([$skills[4] ?? 'Performance Optimization', 'Security Hardening', $topSoftSkills[2] ?? 'Cross-Functional Communication']),
                        'resource_links' => [
                            ['title' => 'OWASP Secure Coding Principles', 'url' => 'https://owasp.org/www-project-top-ten/', 'type' => 'guide'],
                        ],
                    ],
                    [
                        'title' => 'Collaborative Code Review Simulation & Technical Documentation',
                        'description' => 'Draft comprehensive Architectural Decision Records (ADR), OpenAPI / Swagger specs, and simulate asynchronous peer review PR feedback.',
                        'estimated_hours' => 6,
                        'skills_covered' => array_filter(['Technical Documentation', $topSoftSkills[0] ?? 'Technical Communication', 'Constructive Feedback']),
                        'resource_links' => [
                            ['title' => 'Writing Clear Architectural Decision Records (ADRs)', 'url' => 'https://adr.github.io/', 'type' => 'guide'],
                        ],
                    ],
                ],
            ],
            [
                'stage' => 'Week 4 (Days 22–30): Capstone Build, Portfolio & Career Launch',
                'tasks' => [
                    [
                        'title' => 'End-to-End Capstone Project Build & Production Deployment',
                        'description' => 'Finalize a production-ready capstone application demonstrating full competencies in '.$careerPath->title.', deploying on cloud infrastructure with automated CI/CD.',
                        'estimated_hours' => 12,
                        'skills_covered' => array_filter([$skills[5] ?? 'Cloud Deployment', 'CI/CD Pipelines', 'Production Monitoring']),
                        'resource_links' => [
                            ['title' => 'Production Deployment & Cloud Infrastructure Guide', 'url' => 'https://12factor.net/', 'type' => 'reference'],
                        ],
                    ],
                    [
                        'title' => 'Technical Portfolio Showcase, Case Study & Interview Readiness',
                        'description' => 'Package the capstone with a high-impact README, architectural system diagram, live demo URL, and practice behavioral and technical interview scenarios.',
                        'estimated_hours' => 8,
                        'skills_covered' => array_filter(['Technical Storytelling', 'Interview Preparedness', $topSoftSkills[3] ?? 'Professional Presentation']),
                        'resource_links' => [
                            ['title' => 'Engineering Portfolio & Tech Interview Guide', 'url' => 'https://github.com/kamranahmedse/developer-roadmap', 'type' => 'guide'],
                        ],
                    ],
                ],
            ],
        ];

        $order = 1;
        foreach ($milestones as $milestone) {
            $stageName = $milestone['stage'];

            foreach ($milestone['tasks'] as $taskData) {
                $task = RoadmapTask::create([
                    'roadmap_id' => $roadmap->id,
                    'title' => $taskData['title'],
                    'description' => $taskData['description'],
                    'stage' => $stageName,
                    'order' => $order++,
                    'estimated_hours' => $taskData['estimated_hours'],
                    'skills_covered' => $taskData['skills_covered'],
                    'resource_links' => $taskData['resource_links'],
                ]);

                ProgressTracking::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'roadmap_task_id' => $task->id,
                    ],
                    ['status' => 'pending']
                );
            }
        }
    }

    /**
     * Compute soft-skills priorities based on career path expectations, assessment traits, and growth areas.
     *
     * @param  array<string, float>  $traitScores
     * @param  list<string>  $growthAreas
     * @return list<array{skill: string, category: string, priority: string, importance: string, rationale: string, actionable_steps: list<string>, recommended_milestone_week: int}>
     */
    public function getSoftSkillsPriorities(CareerPath $careerPath, array $traitScores = [], array $growthAreas = []): array
    {
        $profiles = [
            'full-stack-software-engineer' => [
                [
                    'skill' => 'Cross-Functional Technical Communication',
                    'category' => 'Communication',
                    'priority' => 'high',
                    'importance' => 'Essential for bridging user experience with backend architectural constraints and aligning with product managers.',
                    'rationale' => 'Full-stack engineers must effectively explain technical trade-offs to non-technical stakeholders and frontend/backend peers.',
                    'actionable_steps' => [
                        'Write clear pull request descriptions detailing architectural rationale and edge case testing.',
                        'Practice articulating technical trade-offs (e.g. SQL normalization vs denormalization) in non-technical terms.',
                    ],
                    'recommended_milestone_week' => 2,
                ],
                [
                    'skill' => 'Agile Task Decomposition & Sprint Estimation',
                    'category' => 'Execution & Time Management',
                    'priority' => 'high',
                    'importance' => 'Breaking complex application epics into bite-sized, shippable increments.',
                    'rationale' => 'Prevents scope creep and guarantees steady incremental delivery across sprints.',
                    'actionable_steps' => [
                        'Decompose large features into sub-tasks that take no more than 4-6 hours to complete.',
                        'Track actual hours against estimated hours to calibrate estimation accuracy.',
                    ],
                    'recommended_milestone_week' => 1,
                ],
                [
                    'skill' => 'Constructive Code Review & Feedback Culture',
                    'category' => 'Teamwork & Collaboration',
                    'priority' => 'medium',
                    'importance' => 'Fosters a psychologically safe, high-performing engineering team culture.',
                    'rationale' => 'Code reviews are learning opportunities rather than gatekeeping exercises.',
                    'actionable_steps' => [
                        'Phrase review comments as curious questions rather than direct commands.',
                        'Highlight well-crafted code and elegant design patterns alongside suggested refactors.',
                    ],
                    'recommended_milestone_week' => 3,
                ],
                [
                    'skill' => 'Systems Debugging Under Ambiguity',
                    'category' => 'Problem Solving',
                    'priority' => 'high',
                    'importance' => 'Methodically diagnosing distributed failures across client, server, and database boundaries.',
                    'rationale' => 'Full-stack issues rarely present obvious single-point failure causes.',
                    'actionable_steps' => [
                        'Apply the scientific method: form a clear hypothesis, isolate variables, and verify with telemetry logs before patching.',
                        'Document root causes in blameless post-mortem logs.',
                    ],
                    'recommended_milestone_week' => 1,
                ],
            ],
            'ai-machine-learning-engineer' => [
                [
                    'skill' => 'Communicating Probabilistic Uncertainty & Model Limitations',
                    'category' => 'Communication',
                    'priority' => 'high',
                    'importance' => 'Crucial for managing business expectations when dealing with non-deterministic AI pipelines.',
                    'rationale' => 'Stakeholders frequently misunderstand hallucination rates and confidence intervals.',
                    'actionable_steps' => [
                        'Frame machine learning results in terms of precision, recall trade-offs, and confidence thresholds.',
                        'Define graceful fallback strategies when models produce low confidence outputs.',
                    ],
                    'recommended_milestone_week' => 2,
                ],
                [
                    'skill' => 'Experimental Rigor & Hypothesis Testing',
                    'category' => 'Problem Solving',
                    'priority' => 'high',
                    'importance' => 'Ensures model benchmarks are reproducible and free from training data leakage.',
                    'rationale' => 'Prevents costly false positives in model performance before production deployment.',
                    'actionable_steps' => [
                        'Maintain meticulous experiment tracking logs (hyperparameters, dataset snapshots, evaluation metrics).',
                        'Establish rigorous baseline controls before introducing complex deep neural architectures.',
                    ],
                    'recommended_milestone_week' => 1,
                ],
                [
                    'skill' => 'Ethical AI & Bias Mitigation',
                    'category' => 'Leadership & Ethics',
                    'priority' => 'high',
                    'importance' => 'Protects user safety, fairness, and regulatory data privacy compliance.',
                    'rationale' => 'AI models can perpetuate systemic biases present in unvetted training corpuses.',
                    'actionable_steps' => [
                        'Conduct demographic parity and fairness audits across model evaluation slices.',
                        'Incorporate human-in-the-loop review guardrails for sensitive automated decisions.',
                    ],
                    'recommended_milestone_week' => 3,
                ],
                [
                    'skill' => 'Cross-Disciplinary Translation',
                    'category' => 'Collaboration',
                    'priority' => 'medium',
                    'importance' => 'Translating domain challenges (medicine, finance, education) into mathematical formulations.',
                    'rationale' => 'Effective ML solutions require deep collaboration with domain subject-matter experts.',
                    'actionable_steps' => [
                        'Shadow domain operators to understand real-world workflows before defining feature sets.',
                    ],
                    'recommended_milestone_week' => 4,
                ],
            ],
            'cloud-devops-engineer' => [
                [
                    'skill' => 'Incident Communication & Crisis Composure',
                    'category' => 'Communication',
                    'priority' => 'high',
                    'importance' => 'Maintains team alignment and transparency during severe production downtime.',
                    'rationale' => 'Clear communication under pressure reduces Mean Time to Resolution (MTTR).',
                    'actionable_steps' => [
                        'Use standardized status updates: Current Impact, Mitigation In Progress, Next Check-in Time.',
                        'Establish clear Incident Commander roles to prevent fragmented duplicate efforts.',
                    ],
                    'recommended_milestone_week' => 2,
                ],
                [
                    'skill' => 'Blameless Post-Mortem & Psychological Safety',
                    'category' => 'Teamwork & Collaboration',
                    'priority' => 'high',
                    'importance' => 'Drives continuous infrastructure resilience without creating fear of failure.',
                    'rationale' => 'Systemic failures stem from insufficient guardrails rather than individual negligence.',
                    'actionable_steps' => [
                        'Focus post-mortems on timeline reconstruction and defensive automation.',
                        'Implement automated preventive assertions for every discovered production bug.',
                    ],
                    'recommended_milestone_week' => 3,
                ],
                [
                    'skill' => 'Clear Technical Documentation & Runbook Writing',
                    'category' => 'Communication',
                    'priority' => 'high',
                    'importance' => 'Enables on-call engineers to resolve alerts safely at 3 AM.',
                    'rationale' => 'Undocumented tribal knowledge creates critical operational bottlenecks.',
                    'actionable_steps' => [
                        'Write step-by-step verification commands alongside remediation steps.',
                        'Test runbooks by having another engineer execute them in staging.',
                    ],
                    'recommended_milestone_week' => 1,
                ],
                [
                    'skill' => 'Security Negotiation & Developer Velocity Balance',
                    'category' => 'Leadership',
                    'priority' => 'medium',
                    'importance' => 'Enforces zero-trust cloud policies without grinding product velocity to a halt.',
                    'rationale' => 'Friction-heavy security leads engineers to bypass official channels.',
                    'actionable_steps' => [
                        'Provide secure-by-default golden templates and automated compliance linters.',
                    ],
                    'recommended_milestone_week' => 4,
                ],
            ],
            'ui-ux-product-designer' => [
                [
                    'skill' => 'User Empathy & Non-Judgmental Active Listening',
                    'category' => 'Communication',
                    'priority' => 'high',
                    'importance' => 'Uncovers latent user pain points during discovery interviews and usability tests.',
                    'rationale' => 'Assuming user desires without direct observational research leads to product failure.',
                    'actionable_steps' => [
                        'Ask open-ended discovery questions (e.g., "Walk me through how you accomplish X today").',
                        'Observe behavioral hesitation and click friction rather than solely relying on verbal opinions.',
                    ],
                    'recommended_milestone_week' => 1,
                ],
                [
                    'skill' => 'Design Rationale Defense & Stakeholder Alignment',
                    'category' => 'Communication',
                    'priority' => 'high',
                    'importance' => 'Connects user interface decisions directly to commercial conversion metrics.',
                    'rationale' => 'Product leaders require data-backed rationale rather than aesthetic preferences.',
                    'actionable_steps' => [
                        'Anchor design presentations in usability telemetry, user quotes, and KPI impact.',
                        'Articulate accessibility and cognitive load principles when defending minimalist layouts.',
                    ],
                    'recommended_milestone_week' => 2,
                ],
                [
                    'skill' => 'Receptiveness to Constructive Critique',
                    'category' => 'Continuous Learning',
                    'priority' => 'high',
                    'importance' => 'Allows continuous iteration without defensiveness or emotional attachment.',
                    'rationale' => 'First iterations are exploratory hypotheses that must be pressure-tested.',
                    'actionable_steps' => [
                        'Separate personal identity from design artifacts during critique sessions.',
                        'Seek out feedback from software engineers early regarding technical feasibility.',
                    ],
                    'recommended_milestone_week' => 3,
                ],
                [
                    'skill' => 'Design System Governance & Consistency',
                    'category' => 'Leadership & Quality',
                    'priority' => 'medium',
                    'importance' => 'Guarantees scalable coherence across multi-platform experiences.',
                    'rationale' => 'Uncontrolled bespoke components inflate technical and visual debt.',
                    'actionable_steps' => [
                        'Maintain shared Figma and code token libraries with explicit state definitions.',
                    ],
                    'recommended_milestone_week' => 4,
                ],
            ],
            'cybersecurity-analyst' => [
                [
                    'skill' => 'Risk Communication & Executive Impact Translation',
                    'category' => 'Communication',
                    'priority' => 'high',
                    'importance' => 'Translates technical CVEs into quantifiable business risk for executive leadership.',
                    'rationale' => 'Executive boards approve security investments based on financial and regulatory exposure.',
                    'actionable_steps' => [
                        'Express threat vectors in terms of financial impact, data leakage probability, and compliance penalties.',
                        'Present remediations in prioritized matrices (Impact vs Implementation Effort).',
                    ],
                    'recommended_milestone_week' => 2,
                ],
                [
                    'skill' => 'Methodical Investigative Tenacity & Pattern Recognition',
                    'category' => 'Problem Solving',
                    'priority' => 'high',
                    'importance' => 'Unravels sophisticated multi-stage intrusion tactics across sprawling SIEM telemetry.',
                    'rationale' => 'Adversaries intentionally obfuscate footprint indicators across noisy log systems.',
                    'actionable_steps' => [
                        'Correlate disparate log sources (DNS, Auth, Endpoint) using standard MITRE ATT&CK techniques.',
                        'Document complete attack kill-chain timelines before concluding containment.',
                    ],
                    'recommended_milestone_week' => 1,
                ],
                [
                    'skill' => 'Ethical Integrity & Strict Confidentiality',
                    'category' => 'Leadership & Ethics',
                    'priority' => 'high',
                    'importance' => 'Maintains absolute trustworthiness when handling privileged access and breaches.',
                    'rationale' => 'Security personnel possess keys to the kingdom and insider vulnerability data.',
                    'actionable_steps' => [
                        'Adhere to least-privilege protocols and rigorous audit logging during investigations.',
                    ],
                    'recommended_milestone_week' => 3,
                ],
                [
                    'skill' => 'Empathetic Security Evangelism',
                    'category' => 'Collaboration',
                    'priority' => 'medium',
                    'importance' => 'Builds a culture of security awareness without fostering adversarial internal politics.',
                    'rationale' => 'Employees bypass draconian security policies if perceived as punitive roadblocks.',
                    'actionable_steps' => [
                        'Run educational simulated phishing reviews focusing on coaching rather than public shaming.',
                    ],
                    'recommended_milestone_week' => 4,
                ],
            ],
            'data-analyst-bi-specialist' => [
                [
                    'skill' => 'Executive Data Storytelling & Visual Presentation',
                    'category' => 'Communication',
                    'priority' => 'high',
                    'importance' => 'Transforms complex tabular metrics into actionable visual narratives that spark executive decisions.',
                    'rationale' => 'Data without compelling narrative framing rarely drives organizational change.',
                    'actionable_steps' => [
                        'Lead dashboard presentations with the core strategic conclusion before detailing technical methodology.',
                        'Limit dashboard noise: highlight the top 3 actionable KPIs that require operational intervention.',
                    ],
                    'recommended_milestone_week' => 2,
                ],
                [
                    'skill' => 'Inquisitive Problem Framing (Asking the Real Question)',
                    'category' => 'Problem Solving',
                    'priority' => 'high',
                    'importance' => 'Identifies the underlying business hypothesis behind ambiguous stakeholder data requests.',
                    'rationale' => 'Stakeholders frequently ask for specific charts that fail to answer their actual strategic dilemma.',
                    'actionable_steps' => [
                        'Conduct 10-minute scoping interviews: "What decision will you make based on this metric?"',
                        'Propose alternative diagnostic cuts that directly illuminate root-cause drivers.',
                    ],
                    'recommended_milestone_week' => 1,
                ],
                [
                    'skill' => 'Rigor in Validating Data Assumptions & Quality',
                    'category' => 'Execution & Quality',
                    'priority' => 'high',
                    'importance' => 'Prevents incorrect strategic decisions caused by pipeline anomalies or survivor bias.',
                    'rationale' => 'A single inaccurate dashboard destroys stakeholder trust in analytical teams.',
                    'actionable_steps' => [
                        'Perform sanity checks on sample distributions and outlier distributions before publishing.',
                        'Explicitly document assumptions, missing value imputations, and confidence boundaries.',
                    ],
                    'recommended_milestone_week' => 3,
                ],
                [
                    'skill' => 'Cross-Departmental Diplomacy & Data Literacy Coaching',
                    'category' => 'Collaboration',
                    'priority' => 'medium',
                    'importance' => 'Empowers non-technical marketing, sales, and operations teams to interpret self-serve dashboards.',
                    'rationale' => 'Data analysts scale their impact by raising the baseline data literacy of the entire organization.',
                    'actionable_steps' => [
                        'Host monthly "Office Hours" helping non-technical colleagues construct their own queries.',
                    ],
                    'recommended_milestone_week' => 4,
                ],
            ],
        ];

        $skills = $profiles[$careerPath->slug] ?? [
            [
                'skill' => 'Professional Written & Spoken Technical Communication',
                'category' => 'Communication',
                'priority' => 'high',
                'importance' => 'Enables clear collaboration and project clarity.',
                'rationale' => 'Communication is the cornerstone of effective execution in any technical discipline.',
                'actionable_steps' => [
                    'Write clear, concise documentation and project summaries.',
                    'Practice summarizing key project takeaways in 2 minutes.',
                ],
                'recommended_milestone_week' => 1,
            ],
            [
                'skill' => 'Structured Problem Solving & Decomposition',
                'category' => 'Problem Solving',
                'priority' => 'high',
                'importance' => 'Breaking down complex challenges into manageable, testable steps.',
                'rationale' => 'Systematic methodology prevents overwhelm in ambitious technical projects.',
                'actionable_steps' => [
                    'Formulate hypotheses before testing solutions.',
                    'Deconstruct requirements into weekly milestones.',
                ],
                'recommended_milestone_week' => 2,
            ],
            [
                'skill' => 'Agile Teamwork & Constructive Collaboration',
                'category' => 'Teamwork',
                'priority' => 'medium',
                'importance' => 'Collaborating effectively within modern cross-functional sprint teams.',
                'rationale' => 'Software and digital products are built by collaborative teams, not solo coders.',
                'actionable_steps' => [
                    'Participate actively in stand-ups and sprint retrospectives.',
                ],
                'recommended_milestone_week' => 3,
            ],
            [
                'skill' => 'Continuous Learning & Growth Mindset',
                'category' => 'Continuous Learning',
                'priority' => 'medium',
                'importance' => 'Staying adaptable in rapidly evolving technology ecosystems.',
                'rationale' => 'Technical frameworks evolve constantly; adaptability is the ultimate career super-power.',
                'actionable_steps' => [
                    'Dedicate 30 minutes daily to reading official documentation or industry case studies.',
                ],
                'recommended_milestone_week' => 4,
            ],
        ];

        // Elevate priority based on trait scores if applicable
        foreach ($skills as &$item) {
            if ($item['category'] === 'Problem Solving' && isset($traitScores['software_development']) && $traitScores['software_development'] < 60) {
                $item['priority'] = 'high';
            }
            if ($item['category'] === 'Communication' && isset($traitScores['design']) && $traitScores['design'] < 60) {
                $item['priority'] = 'high';
            }
        }

        return $skills;
    }

    /**
     * Build strengths, growth areas, and recommendations tailored to the career path (deterministic baseline).
     *
     * @return array{analysis: string, strengths: list<string>, growth_areas: list<string>, recommendations: list<string>}
     */
    protected function buildCareerInsights(CareerPath $career, float $percentage): array
    {
        $title = $career->title;

        return [
            'analysis' => "Your assessment results indicate a {$percentage}% suitability alignment for {$title}. You exhibit strong problem-solving tendencies and aptitude directly matching core industry expectations in {$career->industry}.",
            'strengths' => [
                'Demonstrated problem-solving alignment for '.$title,
                'Aptitude for '.$career->industry.' practices and team workflows',
                'Strong motivation toward iterative project execution',
            ],
            'growth_areas' => [
                'Targeted mastery in: '.implode(', ', array_slice($career->required_skills ?? [], 0, 3)),
                'Building production-ready portfolio projects showcasing real-world problem solving',
            ],
            'recommendations' => [
                'Review the dedicated 30-day accelerated roadmap for '.$title,
                'Build and deploy a capstone project following modern standards',
                'Engage with a mentor or peer community for technical code reviews',
            ],
        ];
    }
}
