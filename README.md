# 🦊 Rafi9i (رفيقي) — AI-Powered Academic & Career Guidance Platform

[![Tests](https://img.shields.io/badge/PHPUnit-111%20Passed-brightgreen.svg?style=flat-square)](tests)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20.svg?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.4-777BB4.svg?style=flat-square&logo=php&logoColor=white)](https://php.net)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black.svg?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

**Rafi9i (رفيقي)** is an intelligent academic guidance, soft-skills development, and career transformation platform tailored specifically for Moroccan high schoolers and university students.

Guided by **Rafi**, an encouraging interactive fox companion, students complete structured assessments, discover objective affinity matches with Moroccan higher education institutions (CPGE, ENSA, ENCG, UM6P, Medicine, etc.), train essential soft skills for oral interviews, and track a 30-day preparation roadmap for national exams and concours.

---

## 🌟 Key Highlights & Features

- 🎓 **Moroccan Stream & School Matching:**
  - Calibrated against actual Moroccan university benchmarks (Sciences Maths, PC, SVT, Économie, Lettres).
  - Deterministic, objective scoring engine comparing user profiles against realistic school thresholds.
- 🦊 **Rafi AI Agent & Mascot:**
  - Real-time interactive AI chatbot powered by OpenRouter (Gemini / Claude models) with fallback heuristics.
  - Tailored to Moroccan educational context, speaking French, English, Standard Arabic, and Moroccan Darija.
- 🌐 **Instant Multilingual System (4 Languages):**
  - **العربية (Arabic)** — Full RTL layout support.
  - **الدارجة المغربية (Moroccan Darija)** — Authentic Moroccan expressions with RTL support.
  - **English** — Global academic layout with LTR direction.
  - **Français** — Standard Moroccan higher education language with LTR direction.
  - Switching language updates the entire website **immediately**, including navigation, cards, buttons, and active chatbot conversations without page reload.
  - Language and theme preferences are preserved in `localStorage` and applied before DOM paint to prevent any flicker.
- 🌓 **Adaptive Light & Dark Modes:**
  - High-contrast, WCAG-compliant readability in Light Mode (no washed-out text).
  - Sleek, modern dark mode preserving eye comfort and visual depth.
- 📊 **30-Day Milestone Roadmaps & Soft Skills Workshop:**
  - Interactive training for 8 core competencies: *Communication*, *Teamwork*, *Time Management*, *Leadership*, *Problem Solving*, *Critical Thinking*, *Adaptability*, and *Self-Confidence*.
  - Task progress tracking with weekly milestones.
- 🛡️ **Robust REST API Backend:**
  - Laravel Sanctum authentication (SPA cookie sessions and API tokens).
  - Multi-tier rate limiting (Brute-force protection, AI quota control, and general API limits).
  - 100% automated test coverage with 111 passing PHPUnit feature tests.

---

## 🏗️ Repository Architecture

This repository is organized as a fullstack monorepo:

```
Rafi9i-back-end/
├── app/                        # Laravel 12 Application Core
│   ├── Http/Controllers/Api/  # REST API Controllers (Auth, Assessments, AI, Roadmap)
│   ├── Models/                 # Eloquent Models (User, Assessment, Roadmap, etc.)
│   └── Services/               # OpenRouter AI & Scoring Services
├── config/                     # Backend Configuration (cors, sanctum, services, etc.)
├── database/                   # Migrations, Factories, and Seeders
├── rafi9i-web/                 # Next.js 15 Frontend Application
│   ├── src/
│   │   ├── app/                # Next.js App Router (Public, Dashboard, Assessment, Auth)
│   │   ├── components/         # React Components (Agent, Mascot, Marketing, UI)
│   │   └── lib/                # API client, i18n engine, stores, types
│   ├── package.json            # Frontend Dependencies & Scripts
│   └── tailwind.config.ts      # Tailwind Styling Configuration
├── routes/                     # API & Console Routes
├── tests/                      # Automated PHPUnit Feature Tests (111 tests)
├── .github/workflows/          # GitHub Actions CI Workflow
├── .env.example                # Backend Environment Template
└── README.md                   # Project Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have the following installed on your machine:
- **PHP 8.4+** with extensions (`pdo`, `pdo_mysql` or `pdo_sqlite`, `mbstring`, `xml`, `curl`, `bcmath`)
- **Composer 2.x**
- **Node.js 20+** & **npm**
- **MySQL 8.x** (or SQLite for lightweight local development)

---

### 1. Backend Setup (Laravel API)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/rafi9i.git
cd rafi9i

# 2. Install PHP dependencies
composer install

# 3. Create your environment file
cp .env.example .env

# 4. Generate the application encryption key
php artisan key:generate

# 5. Configure your database in .env (or use sqlite)
# DB_CONNECTION=mysql
# DB_DATABASE=rafi9i
# DB_USERNAME=root
# DB_PASSWORD=

# 6. Run database migrations and seed demo data
php artisan migrate --seed

# 7. Start the Laravel backend server
php artisan serve
```
The API will be running at `http://127.0.0.1:8000`.

---

### 2. Frontend Setup (Next.js Web App)

Open a new terminal window:

```bash
# 1. Navigate to the frontend directory
cd rafi9i-web

# 2. Install Node dependencies
npm install

# 3. Configure the frontend environment
cp .env.example .env.local

# 4. Start the Next.js development server
npm run dev
```
The frontend will be running at `http://localhost:3000`.

---

## 🧪 Testing & Code Quality

### Running Backend Tests
Execute the full test suite (111 automated tests covering authentication, assessments, roadmaps, and AI integration):
```bash
php artisan test --compact
```

### Running Frontend Type-Check
Ensure 0 TypeScript compilation errors:
```bash
cd rafi9i-web
npx tsc --noEmit
```

### Code Formatting (Laravel Pint)
```bash
vendor/bin/pint --format agent
```

---

## 🔌 API Endpoints Overview

All endpoints return uniform JSON envelopes:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Health Check
- `GET /api/v1/health` — Service health status, database connectivity, and timestamp.

### Authentication
- `POST /api/v1/register` — Create a new student account.
- `POST /api/v1/login` — Authenticate and receive Sanctum token.
- `POST /api/v1/logout` — Revoke token / clear session.
- `GET /api/v1/user` — Retrieve authenticated user profile.

### Assessments & Scoring
- `POST /api/v1/assessments/start` — Start an assessment session.
- `POST /api/v1/assessments/submit` — Submit answers and calculate deterministic affinity scores.
- `GET /api/v1/assessments/results` — Fetch student recommendations and school matches.

### 30-Day Roadmaps & Progress
- `GET /api/v1/roadmap` — Retrieve personalized 30-day weekly milestone roadmap.
- `PATCH /api/v1/roadmap/tasks/{id}` — Toggle task completion status.

### Rafi AI Mascot & Chatbot
- `POST /api/v1/ai/chat` — Send conversation message to Rafi (multilingual OpenRouter integration).

---

## 🔒 Security & Privacy

- **No Secrets Committed:** `.env` and `.env.local` files are strictly excluded from version control.
- **CSRF & CORS:** Strict CORS origins configured for Next.js on `http://localhost:3000`.
- **Rate Limiting:** Protects authentication from brute force and controls third-party AI API consumption.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: add amazing feature'`).
4. Ensure all tests pass (`php artisan test` and `npx tsc --noEmit`).
5. Push to the branch (`git push origin feature/amazing-feature`).
6. Open a Pull Request.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
