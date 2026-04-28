import type {
  ActionItem,
  Analysis,
  FinancialProfile,
  GoalRoadmap,
  ProgressPoint,
  RiskAlert,
  Insight,
  ScenarioOutcome,
  ExplainerCard,
  BudgetBucket,
  SavingsGoal,
} from "@/lib/types";
import {
  addMonthsToDate,
  clamp,
  formatFutureMonth,
  formatMonthLabel,
  monthsUntil,
  safeNumber,
} from "@/lib/utils";

interface Snapshot {
  monthlyIncome: number;
  totalExpenses: number;
  disposableIncome: number;
  currentSavings: number;
  savingsRate: number;
  emergencyFundMonths: number;
  debtRatio: number;
  fixedRatio: number;
  variableRatio: number;
  recommendedMonthlySavings: number;
}

const DISCLAIMER =
  "FinPath AI provides educational guidance only and does not replace regulated financial advice.";

function buildSnapshot(profile: FinancialProfile): Snapshot {
  const monthlyIncome = safeNumber(profile.monthlyIncome);
  const fixedExpenses = safeNumber(profile.fixedExpenses);
  const variableExpenses = safeNumber(profile.variableExpenses);
  const debtPayments = safeNumber(profile.debtPayments);
  const currentSavings = safeNumber(profile.currentSavings);
  const totalExpenses = fixedExpenses + variableExpenses + debtPayments;
  const disposableIncome = monthlyIncome - totalExpenses;
  const savingsRate = monthlyIncome > 0 ? (Math.max(disposableIncome, 0) / monthlyIncome) * 100 : 0;
  const emergencyFundMonths = Math.max(
    safeNumber(profile.habits.emergencyFundMonths),
    currentSavings / Math.max(fixedExpenses + debtPayments + variableExpenses * 0.6, 1),
  );
  const debtRatio = monthlyIncome > 0 ? (debtPayments / monthlyIncome) * 100 : 0;
  const fixedRatio = monthlyIncome > 0 ? (fixedExpenses / monthlyIncome) * 100 : 0;
  const variableRatio = monthlyIncome > 0 ? (variableExpenses / monthlyIncome) * 100 : 0;
  const targetSavings = monthlyIncome > 0 ? monthlyIncome * (safeNumber(profile.savingsRateGoal) / 100) : 0;
  const recommendedMonthlySavings = Math.max(0, Math.min(Math.max(disposableIncome, 0), targetSavings || Math.max(disposableIncome, 0)));

  return {
    monthlyIncome,
    totalExpenses,
    disposableIncome,
    currentSavings,
    savingsRate,
    emergencyFundMonths,
    debtRatio,
    fixedRatio,
    variableRatio,
    recommendedMonthlySavings,
  };
}

function buildHealthScore(profile: FinancialProfile, snapshot: Snapshot) {
  let score = 48;

  score += clamp(snapshot.savingsRate * 1.3, 0, 22);
  score += clamp(snapshot.emergencyFundMonths * 5, 0, 18);
  score -= clamp(snapshot.debtRatio * 0.7, 0, 16);
  score += profile.habits.tracksSpending ? 6 : -5;
  score -= profile.habits.impulseSpending === "high" ? 7 : profile.habits.impulseSpending === "medium" ? 3 : 0;
  score -= profile.habits.paydaySplurges ? 4 : 0;
  score -= profile.habits.debtStress === "high" ? 6 : profile.habits.debtStress === "medium" ? 2 : 0;
  score += clamp((safeNumber(profile.habits.confidence, 3) - 3) * 2.5, -5, 5);
  score -= snapshot.disposableIncome < 0 ? 18 : 0;

  return clamp(Math.round(score), 18, 95);
}

function healthLabel(score: number) {
  if (score >= 78) return "Strong";
  if (score >= 60) return "Building";
  return "Needs attention";
}

function buildBudgetBreakdown(profile: FinancialProfile, snapshot: Snapshot): BudgetBucket[] {
  const monthlyIncome = Math.max(snapshot.monthlyIncome, 1);
  const futureCash = Math.max(snapshot.disposableIncome, 0);
  return [
    {
      label: "Essentials",
      amount: safeNumber(profile.fixedExpenses),
      percent: (safeNumber(profile.fixedExpenses) / monthlyIncome) * 100,
      target: "50-60%",
      tone: "blue",
      description: "Rent, food, transport, and non-negotiable monthly bills.",
    },
    {
      label: "Lifestyle",
      amount: safeNumber(profile.variableExpenses),
      percent: (safeNumber(profile.variableExpenses) / monthlyIncome) * 100,
      target: "20-30%",
      tone: "amber",
      description: "Flexible spending such as takeout, social plans, and subscriptions.",
    },
    {
      label: "Debt",
      amount: safeNumber(profile.debtPayments),
      percent: (safeNumber(profile.debtPayments) / monthlyIncome) * 100,
      target: "<=15%",
      tone: "rose",
      description: "Loan, card, or installment payments that reduce monthly flexibility.",
    },
    {
      label: "Future cash",
      amount: futureCash,
      percent: (futureCash / monthlyIncome) * 100,
      target: ">=20%",
      tone: "emerald",
      description:
        futureCash > 0
          ? "This is the room available for savings, buffers, and faster goal progress."
          : "No monthly room yet — the current budget is fully consumed.",
    },
  ];
}

function buildGoalRoadmap(profile: FinancialProfile, snapshot: Snapshot): GoalRoadmap[] {
  const goals = profile.goals.length > 0 ? profile.goals : [];
  const remainingByGoal = goals.map((goal) => Math.max(goal.targetAmount - goal.currentAmount, 0));
  const totalRemaining = remainingByGoal.reduce((sum, value) => sum + value, 0);
  const pool = Math.max(snapshot.recommendedMonthlySavings, 0);

  return goals.map((goal, index) => {
    const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
    const share = totalRemaining > 0 ? remaining / totalRemaining : 1 / Math.max(goals.length, 1);
    const monthlyContribution = pool > 0 ? pool * share : 0;
    const monthsRemaining = monthsUntil(goal.targetDate);
    const monthlyNeeded = monthsRemaining > 0 ? remaining / monthsRemaining : remaining;
    const monthsToGoal = monthlyContribution > 0 ? Math.ceil(remaining / monthlyContribution) : 999;
    const projectedCompletion = monthsToGoal === 999 ? "Needs more monthly room" : formatFutureMonth(monthsToGoal);

    return {
      name: goal.name || `Goal ${index + 1}`,
      currentAmount: goal.currentAmount,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate,
      monthlyContribution,
      monthlyNeeded,
      monthsRemaining,
      monthsToGoal,
      projectedCompletion,
      onTrack: monthlyContribution >= monthlyNeeded && monthlyContribution > 0,
      gap: Math.max(0, monthlyNeeded - monthlyContribution),
    };
  });
}

function buildRiskAlerts(profile: FinancialProfile, snapshot: Snapshot): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  if (snapshot.disposableIncome < 0) {
    alerts.push({
      title: "Monthly cash flow is negative",
      severity: "high",
      detail: `You are overspending by roughly ${Math.abs(Math.round(snapshot.disposableIncome))} each month, so savings progress will stall until that gap closes.`,
    });
  }

  if (snapshot.emergencyFundMonths < 1.5) {
    alerts.push({
      title: "Emergency cushion is thin",
      severity: snapshot.emergencyFundMonths < 0.75 ? "high" : "medium",
      detail: "A small unexpected bill could push the plan off track, so building a starter cushion should stay high priority.",
    });
  }

  if (snapshot.debtRatio > 15) {
    alerts.push({
      title: "Debt is taking a big share of income",
      severity: snapshot.debtRatio > 22 ? "high" : "medium",
      detail: "High monthly debt payments reduce flexibility and make it harder to build consistent savings momentum.",
    });
  }

  if (snapshot.variableRatio > 30) {
    alerts.push({
      title: "Flexible spending is absorbing your margin",
      severity: snapshot.variableRatio > 38 ? "high" : "medium",
      detail: "Small cuts in flexible spending would unlock faster goal progress without needing a bigger income jump.",
    });
  }

  if (!profile.habits.tracksSpending) {
    alerts.push({
      title: "Spending visibility is low",
      severity: "medium",
      detail: "When spending is not tracked, leaks stay invisible and budgeting decisions feel random instead of intentional.",
    });
  }

  return alerts.slice(0, 4);
}

function buildSpendingInsights(profile: FinancialProfile, snapshot: Snapshot): Insight[] {
  const insights: Insight[] = [];
  const monthlyGap = Math.max(0, Math.round(snapshot.variableRatio - 25));

  insights.push({
    title: "Flex spending is the fastest lever",
    severity: snapshot.variableRatio > 30 ? "medium" : "low",
    detail:
      snapshot.variableRatio > 30
        ? `Your lifestyle spend is ${Math.round(snapshot.variableRatio)}% of income. Trimming even ${Math.max(monthlyGap, 5)}% creates visible room for savings.`
        : "Your flexible spend is reasonably contained, which gives you more room to focus on consistency instead of major cuts.",
  });

  insights.push({
    title: "Automating savings will outperform willpower",
    severity: snapshot.recommendedMonthlySavings > 0 ? "low" : "medium",
    detail:
      snapshot.recommendedMonthlySavings > 0
        ? `There is room to automate about ${Math.round(snapshot.recommendedMonthlySavings)} per month before lifestyle creep absorbs it.`
        : "Right now, the priority is creating positive monthly room before automation becomes meaningful.",
  });

  insights.push({
    title: "Your goals are clear enough to coach against",
    severity: "low",
    detail:
      profile.goals.length > 1
        ? "Multiple goals are okay, but the first milestone should stay simple so progress feels real quickly."
        : "A single visible goal improves follow-through because every monthly decision has a clear destination.",
  });

  return insights;
}

function buildLearningCards(profile: FinancialProfile, snapshot: Snapshot): ExplainerCard[] {
  return [
    {
      title: "Pay yourself first",
      body: "Move savings right after payday instead of waiting to see what is left at month-end.",
      whyItMatters: "Young adults usually lose saving momentum when good intentions compete with flexible spending all month.",
    },
    {
      title: "Emergency fund math",
      body: `A starter emergency fund gives you breathing room. FinPath estimates you currently cover about ${snapshot.emergencyFundMonths.toFixed(1)} months of essential stress coverage.`,
      whyItMatters: "A small buffer reduces panic decisions, debt usage, and the feeling that one surprise can break the plan.",
    },
    {
      title: profile.goals.length > 1 ? "Use sinking funds for multiple goals" : "Give every dollar a job",
      body:
        profile.goals.length > 1
          ? "Separate goal buckets keep one priority from silently eating another. Even small labeled pots make progress easier to trust."
          : "When your monthly surplus has a specific destination, it is much less likely to disappear into random spending.",
      whyItMatters: "Structure lowers decision fatigue and makes tradeoffs easier to explain to yourself.",
    },
  ];
}

function buildActionChecklist(profile: FinancialProfile, snapshot: Snapshot, roadmap: GoalRoadmap[]): ActionItem[] {
  const primaryGoal = roadmap[0];
  return [
    {
      label: `Automate ${Math.max(Math.round(snapshot.recommendedMonthlySavings || Math.max(snapshot.disposableIncome, 0) * 0.75), 25)} on payday`,
      timeframe: "This week",
      impact: "high",
      reason: "Automation protects progress before discretionary spending expands.",
    },
    {
      label: snapshot.variableRatio > 30 ? "Cut one flexible spending category by 10%" : "Keep flexible spending capped with a weekly limit",
      timeframe: "Next 7 days",
      impact: "high",
      reason: "A small recurring cut is usually enough to unlock goal momentum without making the plan feel punishing.",
    },
    {
      label: primaryGoal ? `Name your first visible milestone for ${primaryGoal.name}` : "Set one visible savings milestone",
      timeframe: "This month",
      impact: "medium",
      reason: "Visible milestones make progress feel real sooner, which improves follow-through.",
    },
    {
      label: profile.habits.tracksSpending ? "Review subscriptions and repeat charges" : "Track every flexible purchase for 7 days",
      timeframe: "This week",
      impact: "medium",
      reason: "Tracking or reviewing repeat costs reveals the easiest cuts before you touch higher-friction expenses.",
    },
  ];
}

function buildProgressSeries(snapshot: Snapshot, roadmap: GoalRoadmap[]): ProgressPoint[] {
  const target = roadmap[0]?.targetAmount ?? snapshot.currentSavings + Math.max(snapshot.recommendedMonthlySavings, 100) * 6;
  const neededPerMonth = roadmap[0]?.monthlyNeeded ?? Math.max(snapshot.recommendedMonthlySavings, 0);
  const savedPerMonth = Math.max(snapshot.recommendedMonthlySavings, 0);

  return Array.from({ length: 6 }, (_, index) => ({
    month: formatMonthLabel(addMonthsToDate(new Date(), index).toISOString()),
    saved: snapshot.currentSavings + savedPerMonth * index,
    target: Math.min(target, snapshot.currentSavings + neededPerMonth * index),
  }));
}

function buildBudgetAdvice(profile: FinancialProfile, snapshot: Snapshot, roadmap: GoalRoadmap[]) {
  const largestGap = roadmap.find((goal) => goal.gap > 0);
  return [
    snapshot.disposableIncome > 0
      ? `You have monthly room to work with. Protect that margin before it disappears into flexible spending.`
      : `The first job is closing the monthly cash-flow gap so your plan can start moving forward again.`,
    snapshot.variableRatio > 30
      ? `Your fastest improvement lever is flexible spending — even a modest trim has a visible payoff.`
      : `Your spending mix is fairly stable, so consistency and automation will matter more than dramatic cuts.`,
    largestGap
      ? `${largestGap.name} needs about ${Math.round(largestGap.monthlyNeeded)} each month to land on time, so your current plan should bias toward that milestone first.`
      : `Your current savings cadence is close to goal pace, so the focus should be protecting the routine instead of rebuilding it.`,
  ];
}

function buildSavingsPlan(snapshot: Snapshot, roadmap: GoalRoadmap[]) {
  const firstGoal = roadmap[0];
  const monthlyCommitment = Math.max(Math.round(snapshot.recommendedMonthlySavings), 25);
  return {
    headline: firstGoal
      ? `Aim to lock in about ${monthlyCommitment} each month so ${firstGoal.name} becomes predictable instead of hope-based.`
      : `Start with one automatic monthly savings move so progress no longer depends on memory or motivation.`,
    milestones: firstGoal
      ? [
          `Reach the next ${Math.round(firstGoal.currentAmount + Math.max(firstGoal.monthlyContribution, 50))} in saved balance to prove the system works.`,
          `Keep ${firstGoal.name} as the first destination for new monthly room until the deadline pressure drops.`,
          `Once the first goal is on track, split future savings into separate labeled buckets for the next milestone.`,
        ]
      : [
          "Build the first automated transfer.",
          "Protect it for 30 days.",
          "Then expand to a second goal bucket.",
        ],
    recommendedAutomation: `Set an automatic transfer for ${monthlyCommitment} within 24 hours of payday so savings happen before lifestyle spending decisions.` ,
  };
}

function buildWins(profile: FinancialProfile, snapshot: Snapshot, roadmap: GoalRoadmap[]) {
  const wins: string[] = [];
  if (snapshot.disposableIncome > 0) wins.push("You still have monthly room to direct toward future goals.");
  if (profile.habits.tracksSpending) wins.push("You already track spending, which makes course-correction much faster.");
  if (snapshot.currentSavings > 0) wins.push("You are not starting from zero — there is already a savings base to build on.");
  if (roadmap.length > 0) wins.push("Your goals are specific enough to convert into a real timeline.");
  return wins.slice(0, 3);
}

function buildGaps(profile: FinancialProfile, snapshot: Snapshot, roadmap: GoalRoadmap[]) {
  const gaps: string[] = [];
  if (snapshot.disposableIncome < 0) gaps.push("Current monthly spending is running ahead of income.");
  if (snapshot.emergencyFundMonths < 1.5) gaps.push("Your emergency cushion is still too thin for comfortable resilience.");
  if (!profile.habits.tracksSpending) gaps.push("Spending visibility is low, so leaks are harder to catch early.");
  if (roadmap.some((goal) => goal.gap > 0)) gaps.push("At least one goal is underfunded on the current monthly pace.");
  if (snapshot.variableRatio > 30) gaps.push("Flexible spending is using up room that could accelerate savings.");
  return gaps.slice(0, 3);
}

function buildSummary(profile: FinancialProfile, snapshot: Snapshot, score: number, label: string, roadmap: GoalRoadmap[]) {
  const primaryGoal = roadmap[0];
  const monthlyRoom = Math.round(snapshot.disposableIncome);
  return `${profile.name || "You"} currently has about ${monthlyRoom >= 0 ? `${monthlyRoom}` : `-${Math.abs(monthlyRoom)}`} of monthly room after expenses, which translates to a financial health score of ${score}/100 (${label.toLowerCase()}). ${primaryGoal ? `${primaryGoal.name} is the clearest near-term milestone, so the plan should optimize for that first.` : "The next step is turning loose intention into one repeatable money system."}`;
}

function buildCoachMessage(snapshot: Snapshot, roadmap: GoalRoadmap[], profile: FinancialProfile) {
  const primaryGoal = roadmap[0];
  const automation = Math.max(Math.round(snapshot.recommendedMonthlySavings || Math.max(snapshot.disposableIncome, 0) * 0.75), 25);
  if (snapshot.disposableIncome < 0) {
    return `Right now, the best move is not a bigger goal — it is freeing up monthly room. Start by trimming one flexible category, then automate a small starter save once the budget turns positive.`;
  }
  return `Best next move: automate about ${automation} on payday and tie it to ${primaryGoal?.name ?? "your first priority"}. That keeps progress simple, visible, and much less dependent on motivation.`;
}

export function buildHeuristicAnalysis(profile: FinancialProfile): Analysis {
  const snapshot = buildSnapshot(profile);
  const score = buildHealthScore(profile, snapshot);
  const label = healthLabel(score);
  const savingsRoadmap = buildGoalRoadmap(profile, snapshot);
  const budgetBreakdown = buildBudgetBreakdown(profile, snapshot);
  const riskAlerts = buildRiskAlerts(profile, snapshot);
  const spendingInsights = buildSpendingInsights(profile, snapshot);
  const learningCards = buildLearningCards(profile, snapshot);
  const actionChecklist = buildActionChecklist(profile, snapshot, savingsRoadmap);
  const progressSeries = buildProgressSeries(snapshot, savingsRoadmap);
  const scenarioBaseline = buildScenarioOutcome(profile, 20, 5);
  const topWins = buildWins(profile, snapshot, savingsRoadmap);
  const topGaps = buildGaps(profile, snapshot, savingsRoadmap);

  return {
    generatedAt: new Date().toISOString(),
    source: "fallback",
    summary: buildSummary(profile, snapshot, score, label, savingsRoadmap),
    coachMessage: buildCoachMessage(snapshot, savingsRoadmap, profile),
    healthScore: score,
    healthLabel: label,
    snapshot: {
      monthlyIncome: snapshot.monthlyIncome,
      totalExpenses: snapshot.totalExpenses,
      disposableIncome: snapshot.disposableIncome,
      currentSavings: snapshot.currentSavings,
      savingsRate: snapshot.savingsRate,
      emergencyFundMonths: snapshot.emergencyFundMonths,
      debtRatio: snapshot.debtRatio,
    },
    budgetBreakdown,
    budgetAdvice: buildBudgetAdvice(profile, snapshot, savingsRoadmap),
    savingsPlan: buildSavingsPlan(snapshot, savingsRoadmap),
    savingsRoadmap,
    riskAlerts,
    spendingInsights,
    learningCards,
    actionChecklist,
    progressSeries,
    scenarioBaseline,
    topWins,
    topGaps,
    disclaimer: DISCLAIMER,
  };
}

export function buildScenarioOutcome(
  profile: FinancialProfile,
  saveBoostPercent: number,
  expenseTrimPercent: number,
): ScenarioOutcome {
  const snapshot = buildSnapshot(profile);
  const baseMonthlySavings = Math.max(snapshot.disposableIncome, 0);
  const savingsBoost = baseMonthlySavings * (safeNumber(saveBoostPercent) / 100);
  const expenseTrim = safeNumber(profile.variableExpenses) * (safeNumber(expenseTrimPercent) / 100);
  const monthlySavingsAfter = Math.max(baseMonthlySavings + savingsBoost + expenseTrim, 0);
  const primaryGoal = profile.goals[0];
  const remaining = primaryGoal ? Math.max(primaryGoal.targetAmount - primaryGoal.currentAmount, 0) : 0;
  const baseMonths = remaining > 0 && baseMonthlySavings > 0 ? Math.ceil(remaining / baseMonthlySavings) : 999;
  const newMonths = remaining > 0 && monthlySavingsAfter > 0 ? Math.ceil(remaining / monthlySavingsAfter) : 999;
  const goalEtaShiftMonths = baseMonths !== 999 && newMonths !== 999 ? Math.max(0, baseMonths - newMonths) : 0;
  const projectedSavingsIn6Months = snapshot.currentSavings + monthlySavingsAfter * 6;

  const explanation =
    monthlySavingsAfter > baseMonthlySavings
      ? `This scenario raises monthly savings from about ${Math.round(baseMonthlySavings)} to ${Math.round(monthlySavingsAfter)}. ${goalEtaShiftMonths > 0 ? `That could pull your first goal forward by about ${goalEtaShiftMonths} month${goalEtaShiftMonths === 1 ? "" : "s"}.` : "It mainly strengthens your buffer and reduces pressure on future months."}`
      : `This scenario does not materially improve the monthly savings path yet, so the priority should stay on freeing up stable monthly room.`;

  return {
    label: `Save ${saveBoostPercent}% more + trim ${expenseTrimPercent}% of lifestyle spend`,
    monthlySavingsBefore: baseMonthlySavings,
    monthlySavingsAfter,
    projectedSavingsIn6Months,
    goalEtaShiftMonths,
    explanation,
    recommendedMove:
      monthlySavingsAfter > 0
        ? `Pair a ${Math.round(monthlySavingsAfter)} monthly auto-transfer with one targeted cut in flexible spending so the improvement sticks.`
        : `Start with one concrete spending cut or income boost first; the goal is to create positive monthly room before adding more ambition.`,
  };
}

export function buildFallbackChatReply(profile: FinancialProfile, analysis: Analysis, question: string) {
  const normalized = question.toLowerCase();
  const primaryGoal = analysis.savingsRoadmap[0];
  const baselineScenario = analysis.scenarioBaseline;

  if (normalized.includes("20%") || normalized.includes("save more") || normalized.includes("goal")) {
    return `${baselineScenario.explanation} If you want the cleanest next move, focus on ${primaryGoal?.name ?? "your main goal"} first. ${DISCLAIMER}`;
  }

  if (normalized.includes("budget") || normalized.includes("spend") || normalized.includes("cut")) {
    const biggestBucket = [...analysis.budgetBreakdown].sort((a, b) => b.amount - a.amount)[0];
    return `Your biggest budget lever is ${biggestBucket.label.toLowerCase()}. Start with the smallest recurring cut there, not the most painful one, so the plan stays realistic. ${DISCLAIMER}`;
  }

  if (normalized.includes("emergency") || normalized.includes("cushion") || normalized.includes("buffer")) {
    return `FinPath estimates roughly ${analysis.snapshot.emergencyFundMonths.toFixed(1)} months of cushion right now. A starter emergency fund should come before aggressive lifestyle upgrades because it protects every other goal. ${DISCLAIMER}`;
  }

  if (normalized.includes("debt")) {
    return `Debt is using about ${Math.round(analysis.snapshot.debtRatio)}% of monthly income. Keep minimums reliable, then use any new monthly room to strengthen savings and reduce future stress. ${DISCLAIMER}`;
  }

  return `${analysis.coachMessage} The safest next step is a small automated action you can repeat every month. ${DISCLAIMER}`;
}
