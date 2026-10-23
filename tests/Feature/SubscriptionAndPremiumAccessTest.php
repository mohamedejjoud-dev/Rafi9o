<?php

namespace Tests\Feature;

use App\Models\CareerPath;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SubscriptionAndPremiumAccessTest extends TestCase
{
    use RefreshDatabase;

    protected User $freeUser;

    protected User $adminUser;

    protected CareerPath $careerPath;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        // Free student user
        $this->freeUser = User::factory()->create([
            'email' => 'free_candidate@rafi9i.com',
            'role' => 'student',
            'subscription_status' => 'free',
        ]);
        $this->freeUser->profile()->create([
            'education_level' => 'bachelor',
            'target_role' => 'Full Stack Developer',
        ]);

        // Admin user
        $this->adminUser = User::where('email', 'admin@rafi9i.com')->first();
        if (! $this->adminUser) {
            $this->adminUser = User::factory()->create([
                'email' => 'admin@rafi9i.com',
                'role' => 'admin',
            ]);
        }

        $this->careerPath = CareerPath::first();
    }

    public function test_free_user_cannot_generate_30_day_roadmap_and_gets_403(): void
    {
        Sanctum::actingAs($this->freeUser);

        $response = $this->postJson('/api/v1/roadmaps/generate', [
            'career_path_id' => $this->careerPath->id,
            'career_goals' => 'Learn full stack development in 30 days',
            'duration_days' => 30,
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'status' => 'error',
            ]);

        $this->assertStringContainsString('Premium', $response->json('message'));
    }

    public function test_non_admin_cannot_activate_premium_subscriptions(): void
    {
        Sanctum::actingAs($this->freeUser);
        $targetUser = User::factory()->create(['subscription_status' => 'free']);

        $response = $this->postJson("/api/v1/admin/users/{$targetUser->id}/activate-premium");

        $response->assertStatus(403);
        $this->assertEquals('free', $targetUser->fresh()->subscription_status);
    }

    public function test_authorized_administrator_can_activate_and_deactivate_premium(): void
    {
        Sanctum::actingAs($this->adminUser);

        $targetUser = User::factory()->create([
            'subscription_status' => 'free',
            'email' => 'subscriber@example.com',
        ]);

        // 1. Activate Premium
        $response = $this->postJson("/api/v1/admin/users/{$targetUser->id}/activate-premium", [
            'notes' => 'Verified manual payment of 19 DH via WhatsApp',
            'duration_months' => 1,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.subscription_status', 'premium')
            ->assertJsonPath('data.is_premium', true);

        $this->assertTrue($targetUser->fresh()->isPremium());

        // 2. Deactivate / downgrade
        $deactivateResponse = $this->postJson("/api/v1/admin/users/{$targetUser->id}/deactivate-premium");

        $deactivateResponse->assertStatus(200)
            ->assertJsonPath('data.subscription_status', 'free')
            ->assertJsonPath('data.is_premium', false);

        $this->assertFalse($targetUser->fresh()->isPremium());
    }

    public function test_user_can_generate_roadmap_after_admin_activation(): void
    {
        // 1. Free user initially fails
        Sanctum::actingAs($this->freeUser);
        $initialRes = $this->postJson('/api/v1/roadmaps/generate', [
            'career_path_id' => $this->careerPath->id,
            'career_goals' => 'Fast-track career progression',
        ]);
        $initialRes->assertStatus(403);

        // 2. Admin verifies WhatsApp payment and activates
        Sanctum::actingAs($this->adminUser);
        $this->postJson("/api/v1/admin/users/{$this->freeUser->id}/activate-premium", [
            'notes' => '19 DH confirmed',
        ])->assertStatus(200);

        // 3. User refreshes and can generate roadmap successfully
        Sanctum::actingAs($this->freeUser->fresh());
        $generateRes = $this->postJson('/api/v1/roadmaps/generate', [
            'career_path_id' => $this->careerPath->id,
            'career_goals' => 'Fast-track career progression',
            'duration_days' => 30,
        ]);

        $generateRes->assertStatus(201)
            ->assertJsonPath('data.career_path_id', $this->careerPath->id);
    }

    public function test_guest_cannot_chat_with_rafi(): void
    {
        $this->postJson('/api/v1/agent/chat', ['message' => 'Salam'])->assertUnauthorized();
    }

    public function test_free_and_pending_users_cannot_chat_with_rafi(): void
    {
        Sanctum::actingAs($this->freeUser);
        $this->postJson('/api/v1/agent/chat', ['message' => 'Salam'])
            ->assertForbidden()
            ->assertJson(['code' => 'premium_required']);

        $this->freeUser->forceFill(['subscription_status' => 'pending', 'premium_requested_at' => now()])->save();
        Sanctum::actingAs($this->freeUser->fresh());
        $this->postJson('/api/v1/agent/chat', ['message' => 'Salam'])->assertForbidden();
    }

    public function test_user_with_expired_premium_cannot_chat_with_rafi(): void
    {
        $this->freeUser->forceFill([
            'subscription_status' => 'premium',
            'premium_activated_at' => now()->subMonths(2),
            'premium_expires_at' => now()->subDay(),
        ])->save();
        Sanctum::actingAs($this->freeUser->fresh());

        $this->postJson('/api/v1/agent/chat', ['message' => 'Salam'])->assertForbidden();
    }

    public function test_free_user_cannot_refresh_ai_insights(): void
    {
        Sanctum::actingAs($this->freeUser);

        $this->postJson('/api/v1/assessments/results/1/ai-insights')
            ->assertForbidden()
            ->assertJson(['code' => 'premium_required']);
    }

    public function test_admin_list_shows_pending_requests_first_and_hides_admins(): void
    {
        $pendingUser = User::factory()->create([
            'subscription_status' => 'pending',
            'premium_requested_at' => now()->subMinutes(5),
        ]);
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/admin/subscriptions')->assertOk();

        $response->assertJsonPath('data.pending_count', 1)
            ->assertJsonPath('data.items.0.id', (string) $pendingUser->id);
        $this->assertNotContains('admin', array_column($response->json('data.items'), 'role'));
    }

    public function test_admin_can_filter_and_search_subscribers(): void
    {
        $pendingUser = User::factory()->create([
            'name' => 'Yasmine Pending',
            'subscription_status' => 'pending',
            'premium_requested_at' => now(),
        ]);
        Sanctum::actingAs($this->adminUser);

        $byStatus = $this->getJson('/api/v1/admin/subscriptions?status=pending')->assertOk();
        $this->assertSame([(string) $pendingUser->id], array_column($byStatus->json('data.items'), 'id'));

        $bySearch = $this->getJson('/api/v1/admin/subscriptions?search=free_candidate')->assertOk();
        $this->assertSame([(string) $this->freeUser->id], array_column($bySearch->json('data.items'), 'id'));

        $this->getJson('/api/v1/admin/subscriptions?status=vip')->assertUnprocessable();
    }

    public function test_admin_approving_pending_request_grants_premium_access(): void
    {
        $this->freeUser->forceFill(['subscription_status' => 'pending', 'premium_requested_at' => now()])->save();

        Sanctum::actingAs($this->adminUser);
        $this->postJson("/api/v1/admin/users/{$this->freeUser->id}/activate-premium", ['duration_months' => 12])
            ->assertOk();

        Sanctum::actingAs($this->freeUser->fresh());
        $this->getJson('/api/v1/trial/status')
            ->assertOk()
            ->assertJson(['data' => ['status' => 'subscribed', 'accessLevel' => 'premium']]);
    }
}
