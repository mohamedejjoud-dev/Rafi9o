<?php

namespace Tests\Feature;

use App\Models\AssessmentAttempt;
use App\Models\AssessmentQuestion;
use App\Models\CareerPath;
use App\Models\Profile;
use App\Models\Roadmap;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseRelationshipTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_user_has_profile_one_to_one_relationship(): void
    {
        $user = User::where('email', 'student@rafi9i.com')->first();
        $this->assertNotNull($user);
        $this->assertInstanceOf(Profile::class, $user->profile);
        $this->assertEquals('Amine Bennani', $user->name);
        $this->assertEquals('undergraduate', $user->profile->education_level);
        $this->assertIsArray($user->profile->skills);
        $this->assertContains('JavaScript', $user->profile->skills);
        $this->assertEquals($user->id, $user->profile->user->id);
    }

    public function test_career_paths_are_seeded_with_active_scope(): void
    {
        $career = CareerPath::active()->where('slug', 'full-stack-software-engineer')->first();
        $this->assertNotNull($career);
        $this->assertEquals('Software & Technology', $career->industry);
        $this->assertIsArray($career->required_skills);
        $this->assertContains('PHP/Laravel', $career->required_skills);
    }

    public function test_assessment_questions_have_options_and_scopes(): void
    {
        $questions = AssessmentQuestion::active()->ordered()->get();
        $this->assertGreaterThanOrEqual(8, $questions->count());

        $firstQuestion = $questions->first();
        $this->assertIsArray($firstQuestion->options);
        $this->assertNotEmpty($firstQuestion->options);
        $this->assertArrayHasKey('value', $firstQuestion->options[0]);
        $this->assertArrayHasKey('trait', $firstQuestion->options[0]);
    }

    public function test_assessment_attempt_and_answers_relationships(): void
    {
        $user = User::where('email', 'student@rafi9i.com')->first();
        $attempt = $user->assessmentAttempts()->completed()->first();

        $this->assertNotNull($attempt);
        $this->assertEquals('completed', $attempt->status);
        $this->assertNotNull($attempt->completed_at);
        $this->assertIsArray($attempt->metadata);
        $this->assertArrayHasKey('trait_scores', $attempt->metadata);

        // Answers relation
        $answers = $attempt->answers;
        $this->assertNotEmpty($answers);
        $this->assertInstanceOf(AssessmentQuestion::class, $answers->first()->question);
        $this->assertEquals($attempt->id, $answers->first()->attempt->id);
    }

    public function test_orientation_results_relationships(): void
    {
        $user = User::where('email', 'student@rafi9i.com')->first();
        $results = $user->orientationResults()->topRanked()->get();

        $this->assertNotEmpty($results);
        $top = $results->first();
        $this->assertEquals(1, $top->ranking);
        $this->assertGreaterThan(90.0, (float) $top->match_percentage);
        $this->assertInstanceOf(CareerPath::class, $top->careerPath);
        $this->assertEquals('full-stack-software-engineer', $top->careerPath->slug);
        $this->assertIsArray($top->strengths);
        $this->assertIsArray($top->recommendations);
        $this->assertInstanceOf(AssessmentAttempt::class, $top->attempt);
    }

    public function test_roadmap_tasks_and_progress_tracking_relationships(): void
    {
        $user = User::where('email', 'student@rafi9i.com')->first();
        $roadmap = $user->roadmaps()->active()->with('tasks.progressTrackings')->first();

        $this->assertNotNull($roadmap);
        $this->assertInstanceOf(CareerPath::class, $roadmap->careerPath);
        $this->assertEquals(12, $roadmap->duration_weeks);

        $tasks = $roadmap->tasks;
        $this->assertCount(9, $tasks);

        $firstTask = $tasks->first();
        $this->assertInstanceOf(Roadmap::class, $firstTask->roadmap);
        $this->assertIsArray($firstTask->resource_links);
        $this->assertIsArray($firstTask->skills_covered);

        // Progress Tracking relation
        $progress = $firstTask->progressTrackings->where('user_id', $user->id)->first();
        $this->assertNotNull($progress);
        $this->assertEquals('completed', $progress->status);
        $this->assertEquals(480, $progress->time_spent_minutes);
        $this->assertEquals($user->id, $progress->user->id);
        $this->assertEquals($firstTask->id, $progress->task->id);

        // Check user progress trackings relation
        $userProgresses = $user->progressTrackings;
        $this->assertCount(9, $userProgresses);
        $completedCount = $user->progressTrackings()->completed()->count();
        $this->assertEquals(3, $completedCount);
    }
}
