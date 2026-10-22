<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Rafi9i AI Career Guidance — REST API</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-dark: #0a0e17;
            --card-bg: rgba(16, 24, 39, 0.75);
            --border: rgba(255, 255, 255, 0.08);
            --border-hover: rgba(56, 189, 248, 0.4);
            --accent-cyan: #38bdf8;
            --accent-purple: #a855f7;
            --accent-green: #10b981;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            background-color: var(--bg-dark);
            background-image: 
                radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.12) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.12) 0px, transparent 50%);
            color: var(--text-main);
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            padding: 2.5rem 1.5rem;
        }
        .container {
            width: 100%;
            max-width: 960px;
            margin: auto;
        }
        .header {
            text-align: center;
            margin-bottom: 2.5rem;
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: var(--accent-green);
            padding: 0.35rem 0.9rem;
            border-radius: 9999px;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        .pulse {
            width: 8px;
            height: 8px;
            background: var(--accent-green);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--accent-green);
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
        }
        h1 {
            font-size: 2.5rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            background: linear-gradient(135deg, #ffffff 30%, var(--accent-cyan) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.75rem;
        }
        .subtitle {
            color: var(--text-muted);
            font-size: 1.1rem;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.25rem;
            margin-bottom: 2.5rem;
        }
        .card {
            background: var(--card-bg);
            backdrop-filter: blur(12px);
            border: 1px solid var(--border);
            border-radius: 1rem;
            padding: 1.5rem;
            transition: all 0.2s ease;
        }
        .card:hover {
            border-color: var(--border-hover);
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        }
        .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.75rem;
        }
        .card-title {
            font-weight: 700;
            font-size: 1.05rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .status-pill {
            font-size: 0.75rem;
            padding: 0.2rem 0.6rem;
            border-radius: 6px;
            font-weight: 600;
        }
        .status-ready {
            background: rgba(56, 189, 248, 0.15);
            color: var(--accent-cyan);
            border: 1px solid rgba(56, 189, 248, 0.3);
        }
        .card-desc {
            color: var(--text-muted);
            font-size: 0.9rem;
            line-height: 1.5;
            margin-bottom: 1.25rem;
        }
        .endpoint-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--border);
            color: var(--text-main);
            text-decoration: none;
            padding: 0.5rem 0.85rem;
            border-radius: 0.5rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85rem;
            transition: all 0.2s ease;
        }
        .endpoint-link:hover {
            background: rgba(56, 189, 248, 0.1);
            color: var(--accent-cyan);
            border-color: var(--border-hover);
        }
        .info-panel {
            background: rgba(16, 24, 39, 0.6);
            border: 1px solid var(--border);
            border-radius: 1rem;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }
        .info-panel h3 {
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            color: var(--accent-cyan);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .stats-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
        }
        .stat-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .stat-label {
            font-size: 0.78rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .stat-value {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.95rem;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="badge">
                <span class="pulse"></span>
                <span>REST API Active & Ready</span>
            </div>
            <h1>Rafi9i AI Career Platform</h1>
            <p class="subtitle">
                High-performance Laravel REST API engine powering AI career guidance, deterministic scoring, soft-skills prioritization, and personalized 30-day roadmaps.
            </p>
        </header>

        <div class="grid">
            <div class="card">
                <div class="card-header">
                    <span class="card-title">🩺 Health & Status</span>
                    <span class="status-pill status-ready">Active</span>
                </div>
                <p class="card-desc">
                    Real-time server telemetry, application timestamp, and system versioning endpoint.
                </p>
                <a href="/api/health" target="_blank" class="endpoint-link">
                    GET /api/health →
                </a>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">📋 Career Assessment</span>
                    <span class="status-pill status-ready">Seeded</span>
                </div>
                <p class="card-desc">
                    Published assessment questions with weighted traits across software, AI, devops, design, and security.
                </p>
                <a href="/api/v1/assessments/questions" target="_blank" class="endpoint-link">
                    GET /api/v1/assessments/questions →
                </a>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">🗺️ 30-Day Roadmaps</span>
                    <span class="status-pill status-ready">Operational</span>
                </div>
                <p class="card-desc">
                    Actionable 4-week milestones with task tracking, status toggling, and progress metrics.
                </p>
                <a href="/api/v1/roadmaps" target="_blank" class="endpoint-link">
                    GET /api/v1/roadmaps →
                </a>
            </div>
        </div>

        <div class="info-panel">
            <h3>⚡ System Diagnostics & React Integration</h3>
            <div class="stats-row">
                <div class="stat-item">
                    <span class="stat-label">Environment</span>
                    <span class="stat-value" style="color: var(--accent-green);">{{ config('app.env') }}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">PHP / Laravel</span>
                    <span class="stat-value">{{ phpversion() }} / v{{ app()->version() }}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Test Suite</span>
                    <span class="stat-value" style="color: var(--accent-cyan);">68 Passed (774 Assertions)</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Frontend Origin</span>
                    <span class="stat-value">{{ env('FRONTEND_URL', 'http://localhost:5173') }}</span>
                </div>
            </div>
        </div>

        <footer class="footer">
            <p>Rafi9i API &bull; Built with Laravel 11 & Sanctum &bull; Ready for React SPA Frontend</p>
        </footer>
    </div>
</body>
</html>
