<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de vérification Rafi9i</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            background-color: #f8fafc;
            padding: 40px 16px;
            box-sizing: border-box;
        }
        .card {
            max-width: 560px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 25px -5px rgba(249, 115, 22, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
        }
        .header {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%);
            padding: 36px 32px 30px;
            text-align: center;
            color: #ffffff;
        }
        .logo {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin: 0;
            color: #ffffff;
        }
        .logo-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
            letter-spacing: 0.5px;
        }
        .content {
            padding: 36px 32px 32px;
        }
        h1 {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 16px;
            line-height: 1.3;
        }
        p {
            font-size: 15px;
            line-height: 1.6;
            color: #475569;
            margin: 0 0 20px;
        }
        .code-container {
            background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%);
            border: 2px dashed #f97316;
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            margin: 28px 0;
        }
        .code-label {
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 700;
            color: #c2410c;
            letter-spacing: 1.5px;
            margin-bottom: 8px;
        }
        .code-digits {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 38px;
            font-weight: 800;
            color: #ea580c;
            letter-spacing: 10px;
            margin: 0;
            user-select: all;
        }
        .code-expiry {
            font-size: 12px;
            color: #9a3412;
            margin-top: 8px;
            font-weight: 500;
        }
        .notice {
            background-color: #f8fafc;
            border-left: 4px solid #94a3b8;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 13px;
            color: #64748b;
            margin: 24px 0 0;
            line-height: 1.5;
        }
        .footer {
            background-color: #f8fafc;
            border-top: 1px solid #f1f5f9;
            padding: 24px 32px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.6;
        }
        .arabic-text {
            direction: rtl;
            font-size: 13px;
            color: #64748b;
            margin-top: 6px;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="header">
                <div class="logo">Rafi9i · رفيقي</div>
                <div class="logo-badge">Orientation & Carrières IA</div>
            </div>

            <div class="content">
                <h1>Vérification de ton adresse e-mail</h1>
                <p>
                    Bonjour{{ $name ? ' ' . e($name) : '' }} !<br>
                    Pour valider ton adresse email et finaliser la création de ton compte sur Rafi9i, saisis le code de confirmation suivant :
                </p>

                <div class="code-container">
                    <div class="code-label">Code de confirmation</div>
                    <div class="code-digits">{{ $code }}</div>
                    <div class="code-expiry">Valable pendant 15 minutes</div>
                </div>

                <p>
                    Entre ce code dans le formulaire d'inscription pour activer ton espace personnel et démarrer ton évaluation intelligente.
                </p>

                <div class="notice">
                    <strong>Sécurité :</strong> Si tu n'es pas à l'origine de cette demande de compte, tu peux ignorer cet email en toute sécurité. Ton adresse ne sera pas utilisée.
                </div>
            </div>

            <div class="footer">
                <div>© {{ date('Y') }} Rafi9i. Tous droits réservés.</div>
                <div class="arabic-text">رفيقك الذكي في التوجيه الأكاديمي والمهني بالمغرب.</div>
            </div>
        </div>
    </div>
</body>
</html>
