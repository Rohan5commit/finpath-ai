export type LifeStage = "student" | "intern" | "early-career" | "career-switcher";
export type Severity = "low" | "medium" | "high";
export type ImpactLevel = "low" | "medium" | "high";

export interface SavingsGoal {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface FinancialHabits {
  impulseSpending: Severity;
  tracksSpending: boolean;
  emergencyFundMonths: number;
  debtStress: Severity;
  confidence: number;
  paydaySplurges: boolean;
}

export interface FinancialProfile {
  name: string;
  stage: LifeStage;
  monthlyIncome: number;
  fixedExpenses: number;
  variableExpenses: number;
  debtPayments: number;
  currentSavings: number;
  savingsRateGoal: number;
  goals: SavingsGoal[];
  habits: FinancialHabits;
  concern: string;
}

export interface DemoAccount {
  id: string;
  label: string;
  persona: string;
  blurb: string;
  profile: FinancialProfile;
}

export interface BudgetBucket {
  label: string;
  amount: number;
  percent: number;
  target: string;
  tone: "blue" | "amber" | "emerald" | "rose";
  description: string;
}

export interface GoalRoadmap {
  name: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: string;
  monthlyContribution: number;
  monthlyNeeded: number;
  monthsRemaining: number;
  monthsToGoal: number;
  projectedCompletion: string;
  onTrack: boolean;
  gap: number;
}

export interface RiskAlert {
  title: string;
  severity: Severity;
  detail: string;
}

export interface Insight {
  title: string;
  detail: string;
  severity: Severity;
}

export interface ExplainerCard {
  title: string;
  body: string;
  whyItMatters: string;
}

export interface ActionItem {
  label: string;
  timeframe: string;
  impact: ImpactLevel;
  reason: string;
}

export interface ProgressPoint {
  month: string;
  saved: number;
  target: number;
}

export interface ScenarioOutcome {
  label: string;
  monthlySavingsBefore: number;
  monthlySavingsAfter: number;
  projectedSavingsIn6Months: number;
  goalEtaShiftMonths: number;
  explanation: string;
  recommendedMove: string;
}

export interface Analysis {
  generatedAt: string;
  source: "nim" | "fallback";
  summary: string;
  coachMessage: string;
  healthScore: number;
  healthLabel: string;
  snapshot: {
    monthlyIncome: number;
    totalExpenses: number;
    disposableIncome: number;
    currentSavings: number;
    savingsRate: number;
    emergencyFundMonths: number;
    debtRatio: number;
  };
  budgetBreakdown: BudgetBucket[];
  budgetAdvice: string[];
  savingsPlan: {
    headline: string;
    milestones: string[];
    recommendedAutomation: string;
  };
  savingsRoadmap: GoalRoadmap[];
  riskAlerts: RiskAlert[];
  spendingInsights: Insight[];
  learningCards: ExplainerCard[];
  actionChecklist: ActionItem[];
  progressSeries: ProgressPoint[];
  scenarioBaseline: ScenarioOutcome;
  topWins: string[];
  topGaps: string[];
  disclaimer: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIAnalysisPatch {
  summary: string;
  coachMessage: string;
  budgetAdvice: string[];
  savingsPlan: {
    headline: string;
    milestones: string[];
    recommendedAutomation: string;
  };
  riskAlerts: RiskAlert[];
  spendingInsights: Insight[];
  learningCards: ExplainerCard[];
  actionChecklist: ActionItem[];
  topWins: string[];
  topGaps: string[];
}
