<?php

namespace Tests\Feature;

use Anthropic\Client as AnthropicClient;
use App\Models\User;
use GuzzleHttp\Client as GuzzleClient;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\Sanctum;
use Psr\Http\Message\RequestInterface;
use Tests\TestCase;

class ClaudeIntegrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @var list<array{request: RequestInterface}>
     */
    protected array $sentRequests = [];

    protected function setUp(): void
    {
        parent::setUp();

        Config::set('services.anthropic.api_key', 'sk-ant-test-key');
        Config::set('services.anthropic.model', 'claude-opus-5-5');

        // The Rafi chat is a Premium feature
        Sanctum::actingAs(User::factory()->student()->premium()->create());

        // OpenRouter must never be reached while a Claude key is configured
        Http::preventStrayRequests();
        RateLimiter::clear('ai');
    }

    /**
     * Bind an Anthropic client whose HTTP transport returns the given responses.
     */
    protected function fakeClaude(Response ...$responses): void
    {
        $stack = HandlerStack::create(new MockHandler($responses));
        $stack->push(Middleware::history($this->sentRequests));

        $this->app->instance(AnthropicClient::class, new AnthropicClient(
            apiKey: 'sk-ant-test-key',
            requestOptions: [
                'transporter' => new GuzzleClient(['handler' => $stack]),
                'maxRetries' => 0,
            ],
        ));
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    protected function claudeMessage(array $overrides = []): Response
    {
        return new Response(200, ['Content-Type' => 'application/json'], json_encode(array_merge([
            'id' => 'msg_test',
            'type' => 'message',
            'role' => 'assistant',
            'model' => 'claude-opus-5-5',
            'content' => [
                ['type' => 'text', 'text' => 'Salam! Sciences Maths opens the door to CPGE and ENSA 🦊'],
            ],
            'stop_reason' => 'end_turn',
            'stop_sequence' => null,
            'usage' => ['input_tokens' => 120, 'output_tokens' => 40],
        ], $overrides)));
    }

    public function test_agent_chat_replies_through_claude_when_anthropic_key_is_configured(): void
    {
        $this->fakeClaude($this->claudeMessage());

        $response = $this->postJson('/api/v1/agent/chat', [
            'message' => 'Chno ndir mn b3d Bac SM?',
            'history' => [
                ['role' => 'rafi', 'content' => 'Marhba bik!'],
                ['role' => 'user', 'content' => 'Salam Rafi'],
                ['role' => 'rafi', 'content' => 'Salam! Kifach n9der n3awnek?'],
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.reply', 'Salam! Sciences Maths opens the door to CPGE and ENSA 🦊');

        $this->assertCount(1, $this->sentRequests);
        $request = $this->sentRequests[0]['request'];
        $body = json_decode((string) $request->getBody(), true);

        $this->assertSame('Bearer sk-ant-test-key', $request->getHeaderLine('Authorization'));
        $this->assertStringContainsString('server-side-fallback-2026-07-01', $request->getHeaderLine('anthropic-beta'));
        $this->assertSame('claude-opus-5-5', $body['model']);
        $this->assertSame('default', $body['fallbacks']);
        $this->assertSame(['effort' => 'low'], $body['output_config']);
        $this->assertStringContainsString('Rafi', $body['system']);
        $this->assertArrayNotHasKey('temperature', $body);

        // Leading assistant turn is dropped so the conversation starts with the user
        $this->assertSame(['user', 'assistant', 'user'], array_column($body['messages'], 'role'));
        $this->assertStringEndsWith('Chno ndir mn b3d Bac SM?', $body['messages'][2]['content']);
        $this->assertFalse($request->hasHeader('anthropic-workspace-id'));
    }

    public function test_agent_chat_sends_workspace_header_when_workspace_id_is_configured(): void
    {
        Config::set('services.anthropic.workspace_id', 'wrkspc_test123');
        $this->fakeClaude($this->claudeMessage());

        $this->postJson('/api/v1/agent/chat', ['message' => 'Salam'])->assertOk();

        $this->assertSame('wrkspc_test123', $this->sentRequests[0]['request']->getHeaderLine('anthropic-workspace-id'));
    }

    public function test_agent_chat_falls_back_gracefully_when_claude_returns_an_error(): void
    {
        $this->fakeClaude(new Response(500, ['Content-Type' => 'application/json'], json_encode([
            'type' => 'error',
            'error' => ['type' => 'api_error', 'message' => 'Internal server error'],
        ])));

        $response = $this->postJson('/api/v1/agent/chat', ['message' => 'Salam']);

        $response->assertOk();
        $this->assertStringContainsString('Marhba bik m3a Rafi', $response->json('data.reply'));
    }

    public function test_agent_chat_falls_back_gracefully_when_claude_declines_the_request(): void
    {
        $this->fakeClaude($this->claudeMessage([
            'content' => [],
            'stop_reason' => 'refusal',
            'stop_details' => ['type' => 'refusal', 'category' => null, 'explanation' => null],
        ]));

        $response = $this->postJson('/api/v1/agent/chat', ['message' => 'Salam']);

        $response->assertOk();
        $this->assertStringContainsString('Marhba bik m3a Rafi', $response->json('data.reply'));
    }
}
