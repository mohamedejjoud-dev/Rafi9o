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
}
