# FinPath AI Submission Description

## One-line summary

FinPath AI is an AI-powered financial planning and literacy platform for students and young adults that transforms everyday money stress into clear, personalized next steps.

## Problem

Students and early-career adults often have real financial pressure but limited personalized support. Existing budgeting tools usually track transactions without teaching users how to improve their money decisions in a simple, motivating way.

## Solution

FinPath AI asks for a lightweight financial profile — income, expenses, goals, and habits — and turns it into:

- a financial health snapshot
- a budget breakdown
- a savings roadmap
- risk alerts
- simple financial explainers
- an action checklist
- AI follow-up guidance
- scenario planning

## What makes it compelling

- **Personalized and practical:** guidance is grounded in the user’s own numbers and goals
- **Educational:** the app teaches financial concepts while helping the user act
- **Safe by design:** educational framing, no guaranteed outcomes, no regulated financial advice
- **Demo-ready:** seeded judge accounts and fallback logic prevent broken demos

## Technical implementation

- Next.js 16 + TypeScript + Tailwind CSS
- App Router pages for landing, onboarding, and dashboard
- Server routes for financial analysis, AI follow-up chat, and scenario simulation
- NVIDIA NIM integration using structured JSON outputs for explanations and coaching
- Deterministic fallback engine for budget math and resilience
- GitHub Actions CI + Vercel deployment workflow

## Why it matters

Financial stress affects confidence, decision-making, education outcomes, and early-career mobility. FinPath AI lowers the barrier to financial planning by making it understandable, personalized, and immediately actionable.

## Scalability

FinPath AI can scale through:

- direct-to-consumer student and young-adult adoption
- school and university wellness partnerships
- employer onboarding / internship programs
- fintech partnerships for embedded education and savings experiences

## Judging criteria fit

### Innovation & Originality
FinPath AI combines deterministic finance logic with structured AI coaching to create a product that feels both smart and trustworthy.

### Technical Execution
The build is typed, modular, server-routed, deployment-ready, and robust to missing AI credentials.

### Problem Relevance
The product addresses a large, real, and emotionally resonant problem: young adults need simple, personalized money guidance.

### Scalability & Feasibility
The MVP is simple to ship today and naturally extensible to institutions, fintechs, and broader consumer rollout.
