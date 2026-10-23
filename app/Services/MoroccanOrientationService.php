<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Lang;

class MoroccanOrientationService
{
    /**
     * Match scores of the 5 major academic fields in the Moroccan educational context.
     *
     * @var array<string, int>
     */
    protected array $fieldScores = [
        'informatique-data' => 82,
        'ingenierie' => 74,
        'medecine-sante' => 71,
        'commerce-gestion' => 68,
        'droit-sciences-po' => 63,
    ];

    /**
     * Default current levels of the 8 soft skills priorities.
     *
     * @var array<string, int>
     */
    protected array $softSkillLevels = [
        'communication-orale' => 55,
        'gestion-du-temps' => 62,
        'gestion-du-stress' => 66,
        'pensee-critique' => 72,
        'travail-equipe' => 74,
        'adaptabilite' => 70,
        'leadership' => 58,
        'creativite' => 76,
    ];

    /**
     * Types of the 10 curated learning resources.
     *
     * @var array<string, string>
     */
    protected array $resourceTypes = [
        'res-python-oc' => 'course',
        'res-web-coursera' => 'course',
        'res-maths-fun' => 'course',
        'res-data-alx' => 'course',
        'res-podcast-orientation' => 'podcast',
        'res-podcast-tech' => 'podcast',
        'res-podcast-methodes' => 'podcast',
        'res-ebook-filieres' => 'ebook',
        'res-ebook-apprendre' => 'ebook',
        'res-ebook-confiance' => 'ebook',
    ];

    /**
     * Stages of the 8 roadmap steps.
     *
     * @var array<string, string>
     */
    protected array $roadmapStages = [
        'rm-explore-1' => 'explore',
        'rm-explore-2' => 'explore',
        'rm-learn-1' => 'learn',
        'rm-learn-2' => 'learn',
        'rm-practice-1' => 'practice',
        'rm-practice-2' => 'practice',
        'rm-prepare-1' => 'prepare',
        'rm-prepare-2' => 'prepare',
    ];

    /**
     * Catalog of academic fields, translated in the current locale.
     *
     * @return list<array{id: string, name: string, score: int, explanation: string, strengths: list<string>, potentialChallenges: list<string>, nextAction: string}>
     */
    protected function fieldsCatalog(): array
    {
        $fields = [];

        foreach ($this->fieldScores as $id => $score) {
            $fields[] = [
                'id' => $id,
                'name' => __("orientation.fields.{$id}.name"),
                'score' => $score,
                'explanation' => __("orientation.fields.{$id}.explanation"),
                'strengths' => __("orientation.fields.{$id}.strengths"),
                'potentialChallenges' => __("orientation.fields.{$id}.potentialChallenges"),
                'nextAction' => __("orientation.fields.{$id}.nextAction"),
            ];
        }

        return $fields;
    }

    /**
     * Catalog of soft skills priorities, translated in the current locale.
     *
     * @return list<array{id: string, name: string, currentLevel: int, reason: string, action: string, completed: bool}>
     */
    protected function softSkillsCatalog(): array
    {
        $skills = [];

        foreach ($this->softSkillLevels as $id => $level) {
            $skills[] = [
                'id' => $id,
                'name' => __("orientation.soft_skills.{$id}.name"),
                'currentLevel' => $level,
                'reason' => __("orientation.soft_skills.{$id}.reason"),
                'action' => __("orientation.soft_skills.{$id}.action"),
                'completed' => false,
            ];
        }

        return $skills;
    }

    /**
     * Catalog of curated learning resources, translated in the current locale.
     *
     * @return list<array{id: string, type: string, title: string, description: string, duration: string, completed: bool}>
     */
    protected function resourcesCatalog(): array
    {
        $resources = [];

        foreach ($this->resourceTypes as $id => $type) {
            $resources[] = [
                'id' => $id,
                'type' => $type,
                'title' => __("orientation.resources.{$id}.title"),
                'description' => __("orientation.resources.{$id}.description"),
                'duration' => __("orientation.resources.{$id}.duration"),
                'completed' => false,
            ];
        }

        return $resources;
    }

    /**
     * Catalog of roadmap steps, translated in the current locale.
     *
     * @return list<array{id: string, stage: string, title: string, description: string, completed: bool}>
     */
    protected function roadmapCatalog(): array
    {
        $steps = [];

        foreach ($this->roadmapStages as $id => $stage) {
            $steps[] = [
                'id' => $id,
                'stage' => $stage,
                'title' => __("orientation.roadmap.{$id}.title"),
                'description' => __("orientation.roadmap.{$id}.description"),
                'completed' => false,
            ];
        }

        return $steps;
    }

    /**
     * Build a translated single or multiple choice question.
     *
     * @param  array<string, string>  $emojisByValue
     * @return array<string, mixed>
     */
    protected function choiceQuestion(string $id, string $type, array $emojisByValue, bool $hasHelper = false, ?int $maxSelections = null): array
    {
        $question = [
            'id' => $id,
            'question' => __("orientation.questions.{$id}.question"),
        ];

        if ($hasHelper) {
            $question['helper'] = __("orientation.questions.{$id}.helper");
        }

        $question['type'] = $type;

        if ($maxSelections !== null) {
            $question['maxSelections'] = $maxSelections;
        }

        $question['required'] = true;
        $question['options'] = [];

        foreach ($emojisByValue as $value => $emoji) {
            $question['options'][] = [
                'value' => $value,
                'label' => __("orientation.questions.{$id}.options.{$value}"),
                'emoji' => $emoji,
            ];
        }

        return $question;
    }

    /**
     * Build a translated 1-5 scale question.
     *
     * @return array<string, mixed>
     */
    protected function scaleQuestion(string $id): array
    {
        return [
            'id' => $id,
            'question' => __("orientation.questions.{$id}.question"),
            'type' => 'scale',
            'scale' => [
                'min' => 1,
                'max' => 5,
                'minLabel' => __("orientation.questions.{$id}.minLabel"),
                'maxLabel' => __("orientation.questions.{$id}.maxLabel"),
            ],
            'required' => true,
        ];
    }

    /**
     * Get the 12 Basic Assessment Questions for Moroccan High School students.
     */
    public function getBasicQuestions(): array
    {
        return [
            $this->choiceQuestion('bacStream', 'single', [
                'sciences-math' => '📐',
                'sciences-experimentales' => '🔬',
                'sciences-economiques' => '📊',
                'lettres-sciences-humaines' => '📚',
                'sciences-techniques' => '⚙️',
                'autre' => '🎒',
            ], hasHelper: true),
            $this->choiceQuestion('academicStrengths', 'multi', [
                'logique-math' => '🧮',
                'memoire' => '🧠',
                'redaction' => '✍️',
                'experimentation' => '⚗️',
                'organisation' => '🗂️',
                'creativite' => '💡',
            ], hasHelper: true, maxSelections: 4),
            $this->choiceQuestion('favouriteSubjects', 'multi', [
                'maths' => '➗',
                'physique-chimie' => '🧪',
                'svt' => '🌱',
                'informatique' => '💻',
                'francais' => '🇫🇷',
                'histoire-geo' => '🌍',
                'philosophie' => '🦉',
                'economie' => '📈',
                'langues' => '🗣️',
                'arts' => '🎨',
            ], hasHelper: true, maxSelections: 5),
            $this->choiceQuestion('interests', 'multi', [
                'technologie' => '🤖',
                'sciences' => '🔭',
                'business' => '💼',
                'sante' => '🩺',
                'droit-justice' => '⚖️',
                'culture' => '📖',
                'art' => '🎨',
                'environnement' => '🌿',
            ], hasHelper: true, maxSelections: 5),
            $this->choiceQuestion('preferredActivities', 'multi', [
                'resoudre-problemes' => '🧩',
                'creer-objets' => '🛠️',
                'analyser-donnees' => '📊',
                'aider-ecouter' => '🤝',
                'convaincre-animer' => '🎤',
                'planifier-structurer' => '📋',
            ], hasHelper: true, maxSelections: 4),
            $this->choiceQuestion('workPreference', 'single', [
                'liberte-remote' => '💻',
                'laboratoire' => '🏥',
                'bureau-structure' => '🏢',
                'contact-client' => '👥',
            ]),
            $this->choiceQuestion('city', 'single', [
                'casablanca' => '🏙️',
                'rabat' => '🏛️',
                'tanger' => '🌊',
                'marrakech' => '🌴',
                'fes' => '🏺',
                'agadir' => '☀️',
                'oujda' => '🏜️',
                'etranger' => '✈️',
                'indifferent' => '🧭',
            ]),
            $this->choiceQuestion('studyType', 'single', [
                'public' => '🏛️',
                'prive' => '🎓',
                'indifferent' => '⚖️',
            ]),
            $this->choiceQuestion('budget', 'single', [
                'tres-accessible' => '🪙',
                'modere' => '💵',
                'confortable' => '💳',
                'eleve' => '💎',
            ]),
            $this->choiceQuestion('careerInterests', 'multi', [
                'informatique' => '💻',
                'ingenierie' => '⚡',
                'sante' => '🩺',
                'commerce' => '📢',
                'finance' => '📈',
                'droit' => '⚖️',
                'enseignement' => '🎓',
                'entrepreneur' => '🚀',
            ], hasHelper: true, maxSelections: 5),
            $this->scaleQuestion('confidence'),
            $this->choiceQuestion('mainDifficulty', 'single', [
                'trop-de-choix' => '🌀',
                'manque-info' => '📚',
                'pression-famille' => '💬',
                'peur-selection' => '🎯',
            ]),
        ];
    }

    /**
     * Get the 10 Advanced Assessment Questions for deep dive orientation.
     */
    public function getAdvancedQuestions(): array
    {
        return [
            $this->choiceQuestion('workEnvironment', 'single', [
                'open-space' => '🏢',
                'calme' => '🎧',
                'terrain' => '🏗️',
                'hybride' => '💻',
            ]),
            $this->choiceQuestion('learningStyle', 'single', [
                'pratique' => '🛠️',
                'theorique' => '📚',
                'equilibre' => '⚖️',
            ]),
            $this->choiceQuestion('workMode', 'single', [
                'autonome' => '🎯',
                'collaboratif' => '👥',
                'equilibre' => '🔄',
            ]),
            $this->scaleQuestion('leadershipComfort'),
            $this->scaleQuestion('communicationConfidence'),
            $this->choiceQuestion('mobility', 'single', [
                'ma-ville' => '🏡',
                'national' => '🇲🇦',
                'international' => '✈️',
            ]),
            $this->choiceQuestion('financialConstraint', 'single', [
                'forte' => '🛡️',
                'moyenne' => '⚖️',
                'aucune' => '✨',
            ]),
            $this->choiceQuestion('careerPriority', 'single', [
                'salaire' => '💵',
                'stabilite' => '🛡️',
                'passion' => '❤️',
                'impact' => '🌱',
                'equilibre' => '🌿',
            ]),
            $this->choiceQuestion('longTermGoal', 'single', [
                'expert' => '🎯',
                'direction' => '📊',
                'entreprendre' => '🚀',
                'contribuer' => '🏗️',
                'flexible' => '🕊️',
            ]),
            $this->choiceQuestion('mainObstacle', 'single', [
                'confiance' => '🌧️',
                'finances' => '💰',
                'info' => '🧭',
                'famille' => '👨‍👩‍👧',
                'procrastination' => '⏳',
                'autre' => '🔹',
            ], hasHelper: true),
        ];
    }

    /**
     * Compute 0-100 match percentages for the 5 Moroccan academic fields based on answers.
     */
    public function computeFieldScores(array $answers): array
    {
        $scores = [
            'informatique-data' => 70,
            'ingenierie' => 65,
            'medecine-sante' => 62,
            'commerce-gestion' => 60,
            'droit-sciences-po' => 55,
        ];

        $bump = function (string $id, int $n) use (&$scores) {
            if (isset($scores[$id])) {
                $scores[$id] = min(96, $scores[$id] + $n);
            }
        };

        $stream = $answers['bacStream'] ?? null;
        if ($stream === 'sciences-math') {
            $bump('informatique-data', 6);
            $bump('ingenierie', 4);
        } elseif ($stream === 'sciences-experimentales') {
            $bump('medecine-sante', 5);
            $bump('ingenierie', 3);
        } elseif ($stream === 'sciences-economiques') {
            $bump('commerce-gestion', 6);
        } elseif ($stream === 'lettres-sciences-humaines') {
            $bump('droit-sciences-po', 6);
            $bump('commerce-gestion', 3);
        } elseif ($stream === 'sciences-techniques') {
            $bump('ingenierie', 5);
            $bump('informatique-data', 3);
        }

        $interests = (array) ($answers['interests'] ?? []);
        foreach ($interests as $v) {
            if ($v === 'technologie') {
                $bump('informatique-data', 8);
            }
            if ($v === 'sciences') {
                $bump('ingenierie', 5);
                $bump('medecine-sante', 3);
            }
            if ($v === 'sante') {
                $bump('medecine-sante', 8);
            }
            if ($v === 'business') {
                $bump('commerce-gestion', 7);
            }
            if ($v === 'droit-justice') {
                $bump('droit-sciences-po', 8);
            }
            if ($v === 'culture') {
                $bump('droit-sciences-po', 3);
            }
            if ($v === 'environnement') {
                $bump('ingenierie', 3);
            }
            if ($v === 'art') {
                $bump('commerce-gestion', 2);
            }
        }

        $subjects = (array) ($answers['favouriteSubjects'] ?? []);
        foreach ($subjects as $v) {
            if ($v === 'informatique') {
                $bump('informatique-data', 4);
            }
            if ($v === 'maths') {
                $bump('informatique-data', 3);
                $bump('ingenierie', 2);
            }
            if ($v === 'physique-chimie') {
                $bump('ingenierie', 3);
                $bump('medecine-sante', 2);
            }
            if ($v === 'svt') {
                $bump('medecine-sante', 3);
            }
            if ($v === 'economie') {
                $bump('commerce-gestion', 3);
            }
            if (in_array($v, ['histoire-geo', 'philosophie', 'francais'], true)) {
                $bump('droit-sciences-po', 2);
            }
        }

        $careerInterests = (array) ($answers['careerInterests'] ?? []);
        foreach ($careerInterests as $v) {
            if ($v === 'informatique' || $v === 'data') {
                $bump('informatique-data', 6);
            }
            if ($v === 'ingenierie') {
                $bump('ingenierie', 6);
            }
            if ($v === 'sante') {
                $bump('medecine-sante', 6);
            }
            if (in_array($v, ['commerce', 'finance', 'entrepreneur'], true)) {
                $bump('commerce-gestion', 5);
            }
            if ($v === 'droit') {
                $bump('droit-sciences-po', 6);
            }
        }

        $wp = $answers['workPreference'] ?? null;
        if ($wp === 'laboratoire') {
            $bump('medecine-sante', 3);
            $bump('ingenierie', 3);
        }
        if ($wp === 'bureau-structure') {
            $bump('droit-sciences-po', 3);
            $bump('commerce-gestion', 2);
        }
        if ($wp === 'liberte-remote') {
            $bump('informatique-data', 4);
        }
        if ($wp === 'contact-client') {
            $bump('medecine-sante', 3);
            $bump('commerce-gestion', 3);
        }

        $ranked = [];
        foreach ($scores as $id => $val) {
            $ranked[] = ['id' => $id, 'score' => (int) round($val)];
        }

        usort($ranked, fn ($a, $b) => $b['score'] <=> $a['score']);

        return $ranked;
    }

    /**
     * Build the translated name, Bac stream and city placeholders used in profile summaries.
     *
     * @param  array<string, mixed>  $answers
     * @return array{name: string, stream: string, city: string}
     */
    protected function summaryReplacements(User $user, array $answers): array
    {
        $firstName = explode(' ', trim((string) $user->name))[0];
        $stream = $answers['bacStream'] ?? null;
        $city = $answers['city'] ?? null;

        $streamKey = is_string($stream) && $stream !== 'autre' ? "orientation.questions.bacStream.options.{$stream}" : null;
        $cityKey = is_string($city) ? "orientation.result.cities.{$city}" : null;

        return [
            'name' => $firstName !== '' ? $firstName : __('orientation.result.default_first_name'),
            'stream' => $streamKey !== null && Lang::has($streamKey) ? __($streamKey) : __('orientation.result.default_stream'),
            'city' => $cityKey !== null && Lang::has($cityKey) ? __($cityKey) : __('orientation.result.default_city'),
        ];
    }

    /**
     * Generate the free orientation result object based on basic assessment answers.
     */
    public function generateFreeResult(User $user, array $answers): array
    {
        $scores = $this->computeFieldScores($answers);
        $fieldsById = collect($this->fieldsCatalog())->keyBy('id');

        $topFields = array_map(function ($item) use ($fieldsById) {
            $field = $fieldsById->get($item['id']);

            return array_merge($field, ['score' => $item['score']]);
        }, array_slice($scores, 0, 3));

        $summary = __('orientation.result.free_summary', $this->summaryReplacements($user, $answers));

        $strengthsMap = __('orientation.result.strengths');

        $strengths = [];
        $academicStrengths = (array) ($answers['academicStrengths'] ?? []);
        foreach ($academicStrengths as $s) {
            if (is_string($s) && isset($strengthsMap[$s])) {
                $strengths[] = $strengthsMap[$s];
            }
        }
        if (count($strengths) < 3) {
            array_push($strengths, ...__('orientation.result.default_strengths'));
        }
        $strengths = array_slice($strengths, 0, 3);

        $trial = $this->getTrialStatus($user);

        return [
            'kind' => 'free',
            'result' => [
                'profileSummary' => $summary,
                'topFields' => $topFields,
                'strengths' => $strengths,
                'softSkillPriorities' => [$this->softSkillsCatalog()[0]],
                'resources' => [],
                'roadmap' => [],
            ],
            'accessLevel' => $trial['accessLevel'],
            'source' => 'ai',
            'generatedAt' => now()->toISOString(),
        ];
    }

    /**
     * Generate the complete premium result including customized soft skills, resources, and roadmap.
     */
    public function generatePremiumResult(User $user, array $basic, array $advanced): array
    {
        $freeResult = $this->generateFreeResult($user, $basic);
        $topFields = $freeResult['result']['topFields'];

        $commConfidence = (int) ($advanced['communicationConfidence'] ?? 3);
        $leadComfort = (int) ($advanced['leadershipComfort'] ?? 3);

        $commLevel = max(40, min(80, 30 + 10 * $commConfidence));
        $leadLevel = max(40, min(80, 30 + 10 * $leadComfort));

        $softSkills = $this->softSkillsCatalog();

        $skills = [
            array_merge($softSkills[0], ['currentLevel' => $commLevel]),
            $softSkills[1],
            $leadComfort >= 4
                ? array_merge($softSkills[6], ['currentLevel' => $leadLevel])
                : (($advanced['financialConstraint'] ?? '') === 'forte' ? $softSkills[2] : $softSkills[3]),
        ];

        $primaryFieldName = mb_strtolower($topFields[0]['name'] ?? __('orientation.result.default_field'));

        $summary = __('orientation.result.premium_summary', [
            ...$this->summaryReplacements($user, $basic),
            'field' => $primaryFieldName,
        ]);

        $trial = $this->getTrialStatus($user);

        return [
            'kind' => 'premium',
            'result' => [
                'profileSummary' => $summary,
                'topFields' => $topFields,
                'strengths' => $freeResult['result']['strengths'],
                'softSkillPriorities' => $skills,
                'resources' => $this->resourcesCatalog(),
                'roadmap' => $this->roadmapCatalog(),
            ],
            'accessLevel' => $trial['accessLevel'],
            'source' => 'ai',
            'generatedAt' => now()->toISOString(),
        ];
    }

    /**
     * Compute current subscription status for a user.
     *
     * Statuses: not_started (free), pending (WhatsApp payment awaiting admin verification),
     * subscribed (Premium verified by an admin) and expired.
     *
     * @return array{status: string, startedAt: ?string, expiresAt: ?string, daysRemaining: int, accessLevel: string, requestedAt?: ?string}
     */
    public function getTrialStatus(User $user): array
    {
        if ($user->role === 'admin' || $user->subscription_status === 'premium') {
            if ($user->role !== 'admin' && $user->premium_expires_at && $user->premium_expires_at->isPast()) {
                return [
                    'status' => 'expired',
                    'startedAt' => $user->premium_activated_at?->toISOString(),
                    'expiresAt' => $user->premium_expires_at?->toISOString(),
                    'daysRemaining' => 0,
                    'accessLevel' => 'free',
                ];
            }

            $days = $user->premium_expires_at ? max(0, (int) now()->diffInDays($user->premium_expires_at, false)) : 0;

            return [
                'status' => 'subscribed',
                'startedAt' => $user->premium_activated_at?->toISOString() ?? now()->toISOString(),
                'expiresAt' => $user->premium_expires_at?->toISOString(),
                'daysRemaining' => $days,
                'accessLevel' => 'premium',
            ];
        }

        if ($user->hasPendingPremiumRequest()) {
            return [
                'status' => 'pending',
                'startedAt' => null,
                'expiresAt' => null,
                'daysRemaining' => 0,
                'accessLevel' => 'free',
                'requestedAt' => $user->premium_requested_at?->toISOString(),
            ];
        }

        return [
            'status' => 'not_started',
            'startedAt' => null,
            'expiresAt' => null,
            'daysRemaining' => 0,
            'accessLevel' => 'free',
        ];
    }

    /**
     * Compute dashboard state for the authenticated user.
     */
    public function getDashboard(User $user, ?array $latestResult = null): array
    {
        $trial = $this->getTrialStatus($user);
        $isFree = $latestResult && ($latestResult['kind'] ?? '') === 'free';
        $isPremium = $latestResult && ($latestResult['kind'] ?? '') === 'premium';

        $profileCompletion = 40;
        if ($latestResult) {
            $profileCompletion += 35;
        }
        if ($trial['accessLevel'] === 'premium') {
            $profileCompletion += 25;
        }

        $primaryField = $latestResult['result']['topFields'][0] ?? null;
        $weeklyChallenge = $latestResult['result']['softSkillPriorities'][0] ?? null;

        $nextAction = ! $latestResult
            ? __('orientation.dashboard.next_action.start_assessment')
            : ($trial['status'] === 'not_started' || $trial['status'] === 'expired'
                ? __('orientation.dashboard.next_action.unlock_premium')
                : ($trial['status'] === 'pending'
                    ? __('orientation.dashboard.next_action.pending')
                    : ($trial['status'] === 'subscribed' && ! $isPremium
                    ? __('orientation.dashboard.next_action.advanced_assessment')
                        : __('orientation.dashboard.next_action.weekly_challenge'))));

        return [
            'profileCompletion' => min(100, $profileCompletion),
            'trial' => $trial,
            'orientationStage' => ! $latestResult
                ? __('orientation.dashboard.stage.discovery')
                : (! $isPremium ? __('orientation.dashboard.stage.first_results') : __('orientation.dashboard.stage.advanced')),
            'primaryField' => $primaryField,
            'weeklyChallenge' => $weeklyChallenge,
            'roadmapProgress' => $isPremium ? 25 : 0,
            'completedResources' => $isPremium ? 2 : 0,
            'streak' => 4,
            'nextAction' => $nextAction,
        ];
    }
}
