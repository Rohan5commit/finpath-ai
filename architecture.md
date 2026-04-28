# FinPath AI Architecture

## 1. Product objective

FinPath AI helps students and young adults move from money anxiety to clear action.
The platform combines deterministic finance logic with AI-generated plain-English guidance so the experience stays
both trustworthy and personalized.

## 2. System design

### Frontend

- **Next.js App Router** for the landing page, dashboard, loading states, and error states
- **Client dashboard shell** to manage onboarding, local persistence, seeded demos, and interactive panels
- **Tailwind CSS** for a polished, responsive, judge-friendly UI

### Server routes

- `POST /api/analyze`
  - accepts a financial profile
  - computes deterministic metrics and baseline guidance
  - optionally enriches narratives with NVIDIA NIM structured output
- `POST /api/chat`
  - answers grounded follow-up questions using the user profile + current analysis context
  - falls back to heuristic educational responses if AI is unavailable
- `POST /api/scenario`
  - simulates the impact of saving more or trimming flexible spending

### Core libraries

- `lib/finance.ts`
  - financial health scoring
  - budget breakdown math
  - savings roadmap generation
  - risk alert logic
  - scenario modeling
  - fallback educational responses
- `lib/ai.ts`
  - NVIDIA NIM client
  - JSON extraction and normalization
  - merge strategy between deterministic outputs and AI patch outputs
- `lib/prompts.ts`
  - versioned prompts and structured-output schema hints
- `lib/demo.ts`
  - seeded demo-account loading

## 3. Why the hybrid approach matters

Pure LLM output is not stable enough for a live hackathon demo.
Pure deterministic logic feels generic.

FinPath AI combines both:

- **Deterministic layer** handles numbers, scoring, pacing, and fallback reliability.
- **AI layer** makes explanations, coaching, and action language feel human and personalized.

This is a strong tradeoff for hackathon judging because it improves trust, speed, and reliability at the same time.

## 4. Data model

### Input profile

- stage
- monthly income
- fixed expenses
- variable expenses
- debt payments
- current savings
- savings-rate goal
- savings goals array
- habit signals
- top financial concern

### Analysis output

- financial health score + label
- budget buckets
- budget advice
- savings-plan summary + milestones
- goal-by-goal roadmap
- risk alerts
- spending insights
- explainer cards
- action checklist
- progress series
- baseline scenario outcome

## 5. AI safety design

- Prompts explicitly instruct the model to stay educational, simple, and non-regulated.
- The UI repeats a clear disclaimer that FinPath AI is not individualized financial advice.
- No investment recommendations, guaranteed outcomes, or risky product suggestions.
- AI can improve wording, but deterministic logic remains the source of truth for the financial math.

## 6. Scalability story

### Today

- single-user dashboard
- demo-mode persistence in local storage
- zero-database deployment simplicity

### Next phase

- managed profile storage (Postgres / Supabase / Neon)
- authenticated progress history
- institution dashboards for coaches and schools
- multi-tenant analytics for student cohorts

### Partnership expansion

- fintech API integrations for real transaction categorization
- university partnerships for onboarding cohorts
- employer / internship programs for early-career financial wellness

## 7. Reliability choices for a live demo

- seeded demo accounts for immediate testing
- graceful AI fallback mode
- GitHub Actions CI on every change
- Vercel deployment workflow
- polished loading, error, and empty states

## 8. Judge-facing technical strengths

- typed App Router codebase
- versioned prompts and visible logic
- server-routed AI features
- no hidden magic or fragile one-off scripts
- deployable from GitHub with minimal setup friction
