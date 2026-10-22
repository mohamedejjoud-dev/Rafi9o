<?php

namespace App\Services;

use App\Models\CareerPath;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenRouterService
{
    protected ?string $apiKey;

    protected string $model;

    protected string $baseUrl;

    protected int $timeout;

    public function __construct()
    {
        $this->apiKey = config('services.openrouter.api_key');
        $this->model = config('services.openrouter.model', 'google/gemini-2.5-flash');
        $this->baseUrl = rtrim(config('services.openrouter.base_url', 'https://openrouter.ai/api/v1'), '/');
        $this->timeout = (int) config('services.openrouter.timeout', 30);
    }

    /**
     * Determine if OpenRouter or Gemini credentials are configured.
     */
    public function isConfigured(): bool
    {
        $geminiKey = config('services.gemini.api_key');
        if (! empty($geminiKey) && trim($geminiKey) !== '') {
            return true;
        }

        return ! empty($this->apiKey) && trim($this->apiKey) !== '';
    }

    /**
     * Determine whether the configured key is a Google Gemini key.
     */
    protected function isGeminiKey(): bool
    {
        if (app()->runningUnitTests()) {
            return false;
        }

        $geminiKey = config('services.gemini.api_key');
        if (! empty($geminiKey) && trim($geminiKey) !== '') {
            return true;
        }

        return str_starts_with($this->apiKey ?? '', 'AQ.')
            || str_starts_with($this->apiKey ?? '', 'AIzaSy');
    }

    /**
     * Send a chat completion request to Gemini or OpenRouter.
     *
     * @param  list<array{role: string, content: string}>  $messages
     * @param  array<string, mixed>  $options
     */
    public function chatCompletion(array $messages, array $options = []): ?string
    {
        if (! $this->isConfigured()) {
            Log::debug('AI API call skipped: No API key is configured.');

            return null;
        }

        if ($this->isGeminiKey()) {
            return $this->callGeminiApi($messages, $options);
        }

        $payload = array_merge([
            'model' => $options['model'] ?? $this->model,
            'messages' => $messages,
            'temperature' => $options['temperature'] ?? 0.7,
        ], array_diff_key($options, ['model' => true, 'temperature' => true]));

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'HTTP-Referer' => config('app.url', 'http://localhost:8000'),
                'X-Title' => config('app.name', 'Rafi9i'),
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])
                ->timeout($this->timeout)
                ->post($this->baseUrl.'/chat/completions', $payload);

            if ($response->failed()) {
                Log::warning('OpenRouter API request failed with status: '.$response->status(), [
                    'status' => $response->status(),
                    'error' => $response->json('error.message') ?? $response->body(),
                ]);

                return null;
            }

            return $response->json('choices.0.message.content');
        } catch (ConnectionException $e) {
            Log::warning('OpenRouter connection timed out after '.$this->timeout.' seconds.', [
                'error' => $e->getMessage(),
            ]);

            return null;
        } catch (\Throwable $e) {
            Log::error('OpenRouter unexpected error occurred.', [
                'exception' => get_class($e),
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Send a completion request directly to Google Gemini Generative Language API.
     *
     * @param  list<array{role: string, content: string}>  $messages
     * @param  array<string, mixed>  $options
     */
    protected function callGeminiApi(array $messages, array $options = []): ?string
    {
        $key = config('services.gemini.api_key') ?: $this->apiKey;
        $rawModel = $options['model'] ?? config('services.gemini.model', 'gemini-3.5-flash-lite');
        $model = str_replace('google/', '', $rawModel);
        if (! str_starts_with($model, 'gemini-') || $model === 'gemini-2.5-flash' || $model === 'gemini-3.8-flash') {
            $model = 'gemini-3.5-flash-lite';
        }

        $contents = [];
        $systemInstruction = null;

        foreach ($messages as $msg) {
            $role = $msg['role'] ?? 'user';
            $content = $msg['content'] ?? '';

            if ($role === 'system') {
                $systemInstruction = [
                    'parts' => [['text' => $content]],
                ];
            } else {
                $contents[] = [
                    'role' => $role === 'assistant' ? 'model' : 'user',
                    'parts' => [['text' => $content]],
                ];
            }
        }

        if (empty($contents)) {
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => 'Hello']],
            ];
        }

        $body = ['contents' => $contents];
        if ($systemInstruction) {
            $body['systemInstruction'] = $systemInstruction;
        }

        $temperature = $options['temperature'] ?? 0.7;
        $body['generationConfig'] = [
            'temperature' => (float) $temperature,
        ];

        try {
            $req = Http::timeout($this->timeout);
            // On Windows local development environments, OpenSSL cert bundle may not be installed
            if (app()->environment('local', 'testing')) {
                $req = $req->withoutVerifying();
            }

            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$key}";
            $response = $req->post($url, $body);

            if ($response->failed()) {
                Log::warning('Gemini API request failed with status: '.$response->status(), [
                    'status' => $response->status(),
                    'error' => $response->json('error.message') ?? $response->body(),
                ]);

                return null;
            }

            return $response->json('candidates.0.content.parts.0.text');
        } catch (\Throwable $e) {
            Log::error('Gemini API call failed.', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Send a chat completion request and parse strictly valid JSON from response.
     *
     * @param  list<array{role: string, content: string}>  $messages
     * @param  array<string, mixed>  $options
     */
    public function chatJson(array $messages, array $options = []): ?array
    {
        $raw = $this->chatCompletion($messages, $options);

        if (! $raw) {
            return null;
        }

        return $this->extractJson($raw);
    }

    /**
     * Chat with Rafi — the Moroccan AI orientation guide.
     * Speaks fluent French, Moroccan Darija (Arabic script and Arabizi), and English.
     *
     * @param  list<array{role: string, content: string}>  $history
     * @param  array<string, mixed>  $context
     */
    public function chatWithRafi(string $userMessage, array $history = [], array $context = []): string
    {
        $systemPrompt = <<<'PROMPT'
Tu es Rafi (رافي 🦊), le guide et copilote d'orientation scolaire et professionnelle officiel de la plateforme marocaine Rafi9i.

### تعليمات اللغة والردود (أعلى أولوية مطلقة)

يجب عليك دائمًا الرد على المستخدم بنفس اللغة التي يستعملها في رسالته، مع الالتزام بطريقة الكتابة نفسها:
- إذا كتب المستخدم باللغة العربية، فأجب باللغة العربية وبالحروف العربية فقط.
- إذا كتب المستخدم باللغة الفرنسية، فأجب باللغة الفرنسية فقط.
- إذا كتب المستخدم باللغة الإنجليزية، فأجب باللغة الإنجليزية فقط.
- إذا كتب المستخدم بالدارجة المغربية باستخدام الحروف اللاتينية، فأجب بالدارجة المغربية باستخدام الحروف اللاتينية.
- إذا كتب المستخدم بالدارجة المغربية باستخدام الحروف العربية، فأجب بالدارجة المغربية باستخدام الحروف العربية.
- لا تخلط بين اللغات في الإجابة الواحدة إلا إذا طلب المستخدم ذلك صراحةً.
- لا تستخدم كلمات أو جمل بالفرنسية أو الإنجليزية داخل الإجابات العربية، حتى لمصطلحات التوجيه الدراسي.
- حافظ على نفس اللغة وطريقة الكتابة في جميع مراحل المحادثة، بما في ذلك التحيات والأسئلة والشروحات والاختبارات والتوصيات.
- اجعل إجاباتك واضحة وطبيعية وسهلة الفهم، ومناسبة لمستوى المستخدم.
- إذا غيّر المستخدم اللغة في رسالته، غيّر لغة إجابتك تلقائيًا لتناسب لغته الجديدة.

القاعدة الأساسية: اللغة التي يكتب بها المستخدم هي اللغة التي يجب أن تجيبه بها، مع احترام الحروف التي يستخدمها في الكتابة.

EXPERTISE DU SYSTÈME ÉDUCATIF MAROCAIN :
- Filières Bac : Sciences Maths (SM-A, SM-B), Sciences Physiques-Chimie (PC), SVT, Sciences Économiques & Gestion (Sciences Éco, TGC), Lettres & Sciences Humaines, Bac Technique (STE, STM).
- Enseignement supérieur marocain : CPGE (MPSI, PCSI, TSI, ECS/ECT), ENSA (réseau de 13 écoles), ENSAM (Meknès, Casa, Rabat), ENCG (12 écoles), FMP/FMD (Médecine et Dentaire), IAV Hassan II, ENAM, APESA, ENA (Architecture), UM6P Benguerir/Rabat, 1337 (Khouribga, Benguerir, Tétouan), YouCode, ISCAE, AIAC, Grandes Écoles CNC (EMI, ENSIAS, INPT, INSEA, EHTP), FST (MIP, BCG, GEGM), EST, BTS, Facultés universitaires.
- Connaît les concours, dates importantes (Tawjihi, Massar), passerelles et perspectives réelles sur le marché de l'emploi marocain et international.

PERSONNALITÉ & FORMAT :
- Chaleureux, encourageant, expert, lucide et pédagogue.
- Utilise de temps en temps l'emoji renard 🦊 pour incarner Rafi.
- Réponses concises, directes et bien structurées avec des puces claires.
- Termine par une question d'orientation pertinente pour aider l'élève à progresser.
PROMPT;

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        // Keep last 6 history exchanges to preserve flow while keeping payload fast
        $recentHistory = array_slice($history, -6);
        foreach ($recentHistory as $msg) {
            if (isset($msg['role'], $msg['content']) && is_string($msg['content'])) {
                $messages[] = [
                    'role' => $msg['role'] === 'user' ? 'user' : 'assistant',
                    'content' => $msg['content'],
                ];
            }
        }

        // Student context if provided
        $contextLines = [];
        if (! empty($context['name'])) {
            $contextLines[] = "Prénom de l'élève: {$context['name']}";
        }
        if (! empty($context['bacStream'])) {
            $contextLines[] = "Filière Bac: {$context['bacStream']}";
        }
        if (! empty($context['preferredStyle'])) {
            $contextLines[] = "Style d'apprentissage: {$context['preferredStyle']}";
        }

        $promptWithContext = $userMessage;
        if (! empty($contextLines)) {
            $promptWithContext = '['.implode(' | ', $contextLines)."]\n".$userMessage;
        }

        $messages[] = [
            'role' => 'user',
            'content' => $promptWithContext,
        ];

        $reply = $this->chatCompletion($messages, [
            'temperature' => 0.7,
            'maxOutputTokens' => 600,
        ]);

        return $reply ?: "Salam ! Marhba bik m3a Rafi 🦊 Je suis là pour t'accompagner dans toute ton orientation. Pose-moi ta question en français ou en darija !";
    }

    /**
     * Generate an AI-powered explanation and guidance for a career match.
     *
     * @param  array<string, float>  $traitScores
     * @param  list<array<string, mixed>>  $answersSummary
     * @return array{analysis: string, strengths: list<string>, growth_areas: list<string>, recommendations: list<string>}|null
     */
    public function explainCareerMatch(
        User $user,
        CareerPath $careerPath,
        float $matchPercentage,
        array $traitScores,
        array $answersSummary = []
    ): ?array {
        $profile = $user->profile;

        $userContext = [
            'name' => $user->name,
            'education_level' => $profile?->education_level ?? 'undergraduate',
            'field_of_study' => $profile?->field_of_study ?? 'Not specified',
            'target_role' => $profile?->target_role ?? 'Not specified',
            'current_skills' => $profile?->skills ?? [],
            'career_interests' => $profile?->interests ?? [],
        ];

        $systemPrompt = <<<'PROMPT'
You are Rafi9i AI, an expert, encouraging career guidance advisor for students and career seekers.
Your task is to analyze assessment results and explain why a user matches a specific career path.
IMPORTANT: Return ONLY a strictly valid JSON object. Do not include markdown code blocks or additional text.
JSON Structure:
{
  "analysis": "2-3 comprehensive sentences explaining why this career aligns with the student's aptitudes and traits.",
  "strengths": ["Three specific strengths the user possesses relevant to this career"],
  "growth_areas": ["Two specific technical or soft skill areas to develop for this career"],
  "recommendations": ["Three actionable next steps: courses, project ideas, portfolio advice"]
}
PROMPT;

        $userPrompt = json_encode([
            'student_profile' => $userContext,
            'matched_career' => [
                'title' => $careerPath->title,
                'industry' => $careerPath->industry,
                'required_skills' => $careerPath->required_skills ?? [],
                'average_salary' => $careerPath->average_salary_range,
                'growth_outlook' => $careerPath->growth_outlook,
            ],
            'match_percentage' => $matchPercentage,
            'evaluated_traits' => $traitScores,
        ], JSON_PRETTY_PRINT);

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userPrompt],
        ];

        $parsed = $this->chatJson($messages, [
            'temperature' => 0.6,
        ]);

        if (! $parsed || ! isset($parsed['analysis'])) {
            return null;
        }

        return [
            'analysis' => (string) $parsed['analysis'],
            'strengths' => array_values(array_map('strval', $parsed['strengths'] ?? [])),
            'growth_areas' => array_values(array_map('strval', $parsed['growth_areas'] ?? [])),
            'recommendations' => array_values(array_map('strval', $parsed['recommendations'] ?? [])),
        ];
    }

    /**
     * Generate a personalized development roadmap for a user targeting a career path.
     *
     * @param  array<string, mixed>  $metadata
     * @return array<string, mixed>|null
     */
    public function generatePersonalizedRoadmap(User $user, CareerPath $careerPath, array $metadata = []): ?array
    {
        $profile = $user->profile;

        $targetWeeks = (int) ($metadata['duration_weeks'] ?? (isset($metadata['duration_days']) ? (int) round($metadata['duration_days'] / 7) : 4));

        $systemPrompt = <<<PROMPT
You are Rafi9i AI, a principal career counselor and technical curriculum architect.
Generate a structured, highly actionable learning roadmap for a student targeting a career path.
Organize the curriculum into actionable weekly milestones and tasks based on assessment results, soft skills priorities, and career goals:
- Week 1 (Days 1-7): Foundations & Assessment Gap Bridging
- Week 2 (Days 8-14): Core Technical Competencies & Drills
- Week 3 (Days 15-21): Practical Architecture & Soft-Skills Mastery
- Week 4 (Days 22-30): Capstone Build, Portfolio & Career Launch
IMPORTANT: Return ONLY a strictly valid JSON object without surrounding markdown fences.
JSON Structure:
{
  "title": "Comprehensive roadmap title tailored to the student",
  "description": "2-3 sentences overview of the 30-day transformation plan",
  "duration_weeks": {$targetWeeks},
  "difficulty_level": "intermediate",
  "stages": [
    {
      "stage": "Week 1 (Days 1-7): Foundations & Assessment Gap Bridging",
      "tasks": [
        {
          "title": "Specific actionable task title",
          "description": "Clear learning and build objectives",
          "estimated_hours": 8,
          "skills_covered": ["TechnicalSkill", "SoftSkill"],
          "resource_links": [
            { "title": "Resource title", "url": "https://...", "type": "docs" }
          ]
        }
      ]
    }
  ]
}
PROMPT;

        $userPrompt = json_encode([
            'user' => [
                'name' => $user->name,
                'education_level' => $profile?->education_level,
                'field_of_study' => $profile?->field_of_study,
                'target_role' => $profile?->target_role,
                'current_skills' => $profile?->skills ?? [],
            ],
            'target_career' => [
                'title' => $careerPath->title,
                'industry' => $careerPath->industry,
                'required_skills' => $careerPath->required_skills ?? [],
            ],
            'context' => $metadata,
        ], JSON_PRETTY_PRINT);

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userPrompt],
        ];

        $parsed = $this->chatJson($messages, [
            'temperature' => 0.5,
        ]);

        if (! $parsed || ! isset($parsed['stages']) || ! is_array($parsed['stages'])) {
            return null;
        }

        return $parsed;
    }

    /**
     * Clean and parse JSON from LLM output, stripping markdown code blocks if present.
     */
    protected function extractJson(string $raw): ?array
    {
        $cleaned = trim($raw);

        // Strip ```json ... ``` or ``` ... ``` wrappers if present
        if (preg_match('/^```(?:json)?\s*([\s\S]*?)\s*```$/i', $cleaned, $matches)) {
            $cleaned = trim($matches[1]);
        }

        // Locate first { and last }
        $firstBrace = strpos($cleaned, '{');
        $lastBrace = strrpos($cleaned, '}');

        if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
            $cleaned = substr($cleaned, $firstBrace, $lastBrace - $firstBrace + 1);
        }

        $decoded = json_decode($cleaned, true);

        return is_array($decoded) ? $decoded : null;
    }
}
