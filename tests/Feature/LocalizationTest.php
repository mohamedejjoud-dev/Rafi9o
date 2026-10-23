<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LocalizationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @var array<string, mixed>
     */
    protected array $basicAnswers = [
        'bacStream' => 'sciences-math',
        'city' => 'rabat',
        'academicStrengths' => ['logique-math', 'memoire'],
        'interests' => ['technologie', 'sciences'],
        'favouriteSubjects' => ['maths', 'informatique'],
        'careerInterests' => ['informatique'],
        'workPreference' => 'liberte-remote',
    ];

    public function test_arabic_locale_header_returns_arabic_questions_with_unchanged_option_values(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $french = $this->postJson('/api/v1/assessments/basic/start', [], ['X-Locale' => 'fr'])->assertOk();
        $arabic = $this->postJson('/api/v1/assessments/basic/start', [], ['X-Locale' => 'ar'])->assertOk();

        $this->assertSame('Quelle est ta filière au baccalauréat ?', $french->json('data.questions.0.question'));
        $this->assertSame('ما هي شعبتك في الباكالوريا؟', $arabic->json('data.questions.0.question'));
        $this->assertSame('العلوم الرياضية', $arabic->json('data.questions.0.options.0.label'));
        $this->assertSame(
            array_column($french->json('data.questions'), 'id'),
            array_column($arabic->json('data.questions'), 'id'),
        );
        $this->assertSame(
            array_column($french->json('data.questions.0.options'), 'value'),
            array_column($arabic->json('data.questions.0.options'), 'value'),
        );
    }

    public function test_unsupported_ary_locale_header_falls_back_to_french(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'subscription_status' => 'premium',
            'premium_activated_at' => now(),
        ]));

        $response = $this->postJson('/api/v1/assessments/advanced/start', [], ['X-Locale' => 'ary']);

        $response->assertOk()
            ->assertJsonPath('data.questions.3.id', 'leadershipComfort')
            ->assertJsonPath('data.questions.3.scale.minLabel', 'Je préfère exécuter');
    }

    public function test_unknown_or_missing_locale_header_falls_back_to_french(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $unknown = $this->postJson('/api/v1/assessments/basic/start', [], ['X-Locale' => 'de']);
        $missing = $this->postJson('/api/v1/assessments/basic/start');

        $unknown->assertOk()->assertJsonPath('data.questions.0.question', 'Quelle est ta filière au baccalauréat ?');
        $missing->assertOk()->assertJsonPath('data.questions.0.question', 'Quelle est ta filière au baccalauréat ?');
    }

    public function test_submitted_result_is_written_in_request_locale_with_same_structure_and_scores_as_french(): void
    {
        $frenchStudent = User::factory()->create(['name' => 'Sara Alaoui']);
        $englishStudent = User::factory()->create(['name' => 'Sara Bennani']);
        $payload = ['sessionId' => 'sess-basic-1', 'answers' => $this->basicAnswers];

        Sanctum::actingAs($frenchStudent);
        $french = $this->postJson('/api/v1/assessments/basic/submit', $payload, ['X-Locale' => 'fr'])->assertOk();
        Sanctum::actingAs($englishStudent);
        $english = $this->postJson('/api/v1/assessments/basic/submit', $payload, ['X-Locale' => 'en'])->assertOk();

        $frenchResult = $french->json('data.result.result');
        $englishResult = $english->json('data.result.result');

        $this->assertStringStartsWith('Sara, élève en Sciences Mathématiques basé(e) à Rabat.', $frenchResult['profileSummary']);
        $this->assertStringStartsWith('Sara, a student in Mathematical Sciences, based in Rabat.', $englishResult['profileSummary']);
        $this->assertSame('Informatique & Data', $frenchResult['topFields'][0]['name']);
        $this->assertSame('Computer Science & Data', $englishResult['topFields'][0]['name']);
        $this->assertSame('Logical rigour and ease with numbers', $englishResult['strengths'][0]);
        $this->assertSame('Public speaking', $englishResult['softSkillPriorities'][0]['name']);

        $this->assertSame(array_keys($frenchResult), array_keys($englishResult));
        $this->assertSame(array_keys($frenchResult['topFields'][0]), array_keys($englishResult['topFields'][0]));
        $this->assertSame(
            array_map(fn (array $field): array => [$field['id'], $field['score']], $frenchResult['topFields']),
            array_map(fn (array $field): array => [$field['id'], $field['score']], $englishResult['topFields']),
        );
        $this->assertCount(count($frenchResult['strengths']), $englishResult['strengths']);
        $this->assertSame(
            [$frenchResult['softSkillPriorities'][0]['id'], $frenchResult['softSkillPriorities'][0]['currentLevel']],
            [$englishResult['softSkillPriorities'][0]['id'], $englishResult['softSkillPriorities'][0]['currentLevel']],
        );
    }

    public function test_premium_result_resources_and_roadmap_are_written_in_request_locale(): void
    {
        $student = User::factory()->create([
            'subscription_status' => 'premium',
            'premium_activated_at' => now(),
        ]);
        Sanctum::actingAs($student);

        $response = $this->postJson('/api/v1/assessments/advanced/submit', [
            'sessionId' => 'sess-advanced-1',
            'answers' => ['leadershipComfort' => 5, 'communicationConfidence' => 2],
        ], ['X-Locale' => 'ar']);

        $response->assertOk()
            ->assertJsonPath('data.result.kind', 'premium')
            ->assertJsonPath('data.result.result.resources.0.id', 'res-python-oc')
            ->assertJsonPath('data.result.result.resources.0.title', 'أساسيات Python')
            ->assertJsonPath('data.result.result.roadmap.0.stage', 'explore')
            ->assertJsonPath('data.result.result.roadmap.0.title', 'التقِ بطالب في المجال')
            ->assertJsonPath('data.result.result.softSkillPriorities.0.currentLevel', 50)
            ->assertJsonPath('data.result.result.softSkillPriorities.2.id', 'leadership')
            ->assertJsonPath('data.result.result.softSkillPriorities.2.currentLevel', 80);
    }

    public function test_dashboard_texts_are_returned_in_request_locale(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/v1/dashboard', ['X-Locale' => 'en']);

        $response->assertOk()
            ->assertJsonPath('data.nextAction', 'Complete the orientation assessment (10 minutes) to unlock your first result.')
            ->assertJsonPath('data.orientationStage', 'Discovery — basic assessment to complete');
    }

    public function test_premium_request_message_is_returned_in_request_locale(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/v1/premium/request', [], ['X-Locale' => 'ar']);

        $response->assertOk()
            ->assertJsonPath('message', 'تم استلام طلب Premium. سيتحقق أحد المسؤولين من تحويلك قريبًا.')
            ->assertJsonPath('data.status', 'pending');
    }
}
