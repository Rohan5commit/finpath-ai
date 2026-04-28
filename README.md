# FinPath AI

FinPath AI is an AI-powered financial planning and financial literacy platform for students and young adults.
It turns raw money habits into a simple financial health snapshot, personalized budget guidance, savings roadmaps,
grounded follow-up answers, and scenario planning that still works even if no AI key is present.

## Why this is strong for Nexforge

- **Innovation & Originality:** financial coaching feels practical, personalized, and interactive instead of generic blog advice.
- **Technical Execution:** clean Next.js App Router architecture, typed server routes, seeded demo accounts, CI, and Vercel deploy workflow.
- **Problem Relevance:** directly targets student and young-adult financial stress, uncertainty, and money literacy gaps.
- **Scalability & Feasibility:** works as a consumer app today and expands naturally to schools, universities, fintech partners, and employee benefit programs.

## Core product flow

1. User enters income, expenses, savings goals, and habits.
2. FinPath AI builds a financial health snapshot.
3. The app returns a budget breakdown, savings roadmap, risk alerts, explainers, and an action checklist.
4. The user asks grounded follow-up questions through the AI budgeting assistant.
5. The user stress-tests their plan with a scenario simulator and progress tracker.

## Feature set

- Onboarding flow for financial profile input
- Financial health dashboard with score + summary
- AI budgeting assistant with safe educational answers
- Savings-goal planner with milestone pacing
- Spending insights + risk alerts
- Financial literacy explainer cards
- Scenario simulator for “what if I save 20% more?”
- Progress tracker
- Seeded judge demo accounts
- Demo-safe fallback mode if no AI key exists

## Demo accounts for judges

- **Maya** — irregular student income, emergency fund + laptop goal
- **Jordan** — first-job budget optimization and move-out buffer
- **Aisha** — internship runway, family responsibilities, certification fund

No login is required. Judges can open `/dashboard?demo=maya-campus` (or the other demo IDs) and start immediately.

## Tech stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **AI layer:** NVIDIA NIM via OpenAI-compatible `chat/completions`
- **State/storage:** local demo persistence via browser storage for speed and portability
- **Deployment:** Vercel + GitHub Actions

## Responsible AI and safety

- FinPath AI is framed as **educational guidance**, not regulated financial advice.
- No guaranteed outcomes, investing calls, or individualized product recommendations.
- If the NVIDIA NIM key is missing or the call fails, the product falls back to deterministic demo guidance so the app remains fully explorable.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Environment variables:

- `NVIDIA_NIM_API_KEY` — optional for live AI
- `NVIDIA_NIM_BASE_URL` — defaults to the NVIDIA OpenAI-compatible endpoint
- `NVIDIA_NIM_MODEL` — defaults to `openai/gpt-oss-120b`
- `NEXT_PUBLIC_APP_URL` — optional, useful for metadata and canonical URLs

## GitHub Actions

- `ci.yml` runs type-check + production build on every push and pull request.
- `deploy.yml` deploys to Vercel on pushes to `main` using repository secrets:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

## Exact repo tree

```text
finpath-ai/
├── .env.example
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── .gitignore
├── README.md
├── app/
│   ├── api/
│   │   ├── analyze/route.ts
│   │   ├── chat/route.ts
│   │   └── scenario/route.ts
│   ├── dashboard/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── architecture.md
├── components/
│   ├── dashboard/
│   │   ├── action-checklist.tsx
│   │   ├── budget-chart.tsx
│   │   ├── chat-assistant.tsx
│   │   ├── dashboard-shell.tsx
│   │   ├── dashboard-skeleton.tsx
│   │   ├── explainer-cards.tsx
│   │   ├── goal-planner.tsx
│   │   ├── health-hero.tsx
│   │   ├── onboarding-form.tsx
│   │   ├── progress-tracker.tsx
│   │   ├── scenario-simulator.tsx
│   │   └── spending-insights.tsx
│   ├── landing/
│   │   ├── feature-grid.tsx
│   │   ├── hero.tsx
│   │   └── judge-demo-banner.tsx
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── empty-state.tsx
│       ├── input.tsx
│       ├── progress.tsx
│       ├── section-heading.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       └── textarea.tsx
├── data/
│   └── demo-accounts.json
├── demo-script.md
├── elevator-pitch.md
├── final-submission-checklist.md
├── lib/
│   ├── ai.ts
│   ├── demo.ts
│   ├── finance.ts
│   ├── prompts.ts
│   ├── types.ts
│   └── utils.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── pitch-deck-outline.md
├── postcss.config.mjs
├── submission-description.md
├── tsconfig.json
└── vercel.json
```

## Submission assets in this repo

- `architecture.md`
- `pitch-deck-outline.md`
- `demo-script.md`
- `submission-description.md`
- `elevator-pitch.md`
- `final-submission-checklist.md`
- `data/demo-accounts.json`

## Scalability roadmap

1. **Student launch:** campus ambassadors, university wellness programs, seed demo accounts.
2. **Institutional rollout:** dashboards for schools, scholarship offices, and financial literacy workshops.
3. **Fintech partnerships:** embedded savings nudges, payroll-linked goal tracking, and contextual education modules.
4. **Consumer growth:** longitudinal planning, family accounts, and personalized behavioral coaching.

## Notes for judges

- The app is intentionally fast to understand in under 3 minutes.
- The seeded demos make the judging flow immediate.
- The fallback mode prevents broken demos if AI quota or secrets are unavailable.
