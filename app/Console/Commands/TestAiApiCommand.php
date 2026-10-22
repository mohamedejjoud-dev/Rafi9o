<?php

namespace App\Console\Commands;

use App\Services\OpenRouterService;
use Illuminate\Console\Command;

class TestAiApiCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:test {--prompt=Say hello in 5 words : Custom prompt to send to OpenRouter}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the OpenRouter AI API integration and latency without exposing secrets';

    /**
     * Execute the console command.
     */
    public function handle(OpenRouterService $openRouter): int
    {
        $this->info('==============================================');
        $this->info('       Rafi9i AI - OpenRouter API Test        ');
        $this->info('==============================================');

        $isConfigured = $openRouter->isConfigured();
        $model = config('services.openrouter.model', 'google/gemini-2.5-flash');
        $baseUrl = config('services.openrouter.base_url', 'https://openrouter.ai/api/v1');
        $timeout = config('services.openrouter.timeout', 30);

        $this->table(
            ['Configuration', 'Value'],
            [
                ['API Key Configured', $isConfigured ? '<fg=green>YES (Set in .env)</>' : '<fg=red>NO (Missing in .env)</>'],
                ['Configured Model', $model],
                ['API Base URL', $baseUrl],
                ['Request Timeout', $timeout.' seconds'],
            ]
        );

        if (! $isConfigured) {
            $this->error('ERROR: OPENROUTER_API_KEY is not set or is empty in your .env file.');
            $this->line('');
            $this->line('To resolve this:');
            $this->line('1. Open your backend .env file');
            $this->line('2. Paste your OpenRouter key into: <fg=yellow>OPENROUTER_API_KEY=sk-or-v1-...</>');
            $this->line('3. Save the file (Ctrl+S) and run: <fg=cyan>php artisan ai:test</>');
            $this->line('');

            return self::FAILURE;
        }

        $prompt = (string) $this->option('prompt');
        $this->line('');
        $this->info("Sending test completion request to [{$model}]...");
        $this->comment("Prompt: \"{$prompt}\"");

        $start = microtime(true);
        $response = $openRouter->chatCompletion([
            ['role' => 'system', 'content' => 'You are Rafi9i AI test bot. Respond concisely.'],
            ['role' => 'user', 'content' => $prompt],
        ], ['temperature' => 0.2]);
        $duration = round((microtime(true) - $start) * 1000);

        if (! $response) {
            $this->error("FAILED: OpenRouter API call returned null after {$duration}ms.");
            $this->line('Please check:');
            $this->line('- Your API key validity and credit balance at https://openrouter.ai/keys');
            $this->line('- Recent error logs in storage/logs/laravel.log');
            $this->line('');

            return self::FAILURE;
        }

        $this->info("<fg=green>✓ Success!</> Response received in {$duration}ms:");
        $this->line('<fg=white>'.trim($response).'</>');

        // Test JSON parsing capabilities
        $this->line('');
        $this->info('Testing structured JSON response extraction...');
        $jsonResponse = $openRouter->chatJson([
            ['role' => 'system', 'content' => 'Return strictly valid JSON only with keys: status, message, sample_skills.'],
            ['role' => 'user', 'content' => 'Generate sample career skills JSON for testing.'],
        ]);

        if ($jsonResponse && is_array($jsonResponse)) {
            $this->info('<fg=green>✓ JSON Extraction Succeeded!</>');
            $this->line(json_encode($jsonResponse, JSON_PRETTY_PRINT));
        } else {
            $this->warn('Notice: Structured JSON test did not parse cleanly. Falling back to default heuristics.');
        }

        $this->line('');
        $this->info('AI Integration is operational and ready for career guidance requests.');

        return self::SUCCESS;
    }
}
