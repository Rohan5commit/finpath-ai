import type { Analysis, ChatMessage, FinancialHabits, FinancialProfile, SavingsGoal } from "@/lib/types";

type ValidationResult<T> = { success: true; data: T } | { success: false; error: string };

const LIFE_STAGES = ["student", "intern", "early-career", "career-switcher"] as const;
const SEVERITIES = ["low", "medium", "high"] as const;
const CHAT_ROLES = ["user", "assistant"] as const;
const BUDGET_TONES = ["blue", "amber", "emerald", "rose"] as const;

function ok<T>(data: T): ValidationResult<T> {
  return { success: true, data };
}

function fail<T = never>(error: string): ValidationResult<T> {
  return { success: false, error };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(
  value: unknown,
  label: string,
  options: { min?: number; max?: number; allowEmpty?: boolean } = {},
): ValidationResult<string> {
  const { min = 1, max = 240, allowEmpty = false } = options;
  if (typeof value !== "string") {
    return fail(`${label} must be a string.`);
  }
  const normalized = value.trim();
  if (!allowEmpty && normalized.length < min) {
    return fail(`${label} must be at least ${min} character${min === 1 ? "" : "s"}.`);
  }
  if (normalized.length > max) {
    return fail(`${label} must be ${max} characters or fewer.`);
  }
  return ok(normalized);
}

function readNumber(
  value: unknown,
  label: string,
  options: { min?: number; max?: number } = {},
): ValidationResult<number> {
  const { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = options;
  const normalized =
    typeof value === "string" && value.trim() !== "" ? Number(value) : typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(normalized)) {
    return fail(`${label} must be a valid number.`);
  }
  if (normalized < min) {
    return fail(`${label} must be at least ${min}.`);
  }
  if (normalized > max) {
    return fail(`${label} must be ${max} or lower.`);
  }
  return ok(normalized);
}

function readBoolean(value: unknown, label: string): ValidationResult<boolean> {
  if (typeof value !== "boolean") {
    return fail(`${label} must be true or false.`);
  }
  return ok(value);
}

function readEnum<T extends string>(value: unknown, label: string, allowed: readonly T[]): ValidationResult<T> {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    return fail(`${label} must be one of ${allowed.join(", ")}.`);
  }
  return ok(value as T);
}

function readStringArray(
  value: unknown,
  label: string,
  options: { min?: number; max?: number } = {},
): ValidationResult<string[]> {
  const { min = 0, max = 5 } = options;
  if (!Array.isArray(value)) {
    return fail(`${label} must be an array of strings.`);
  }
  if (value.length < min || value.length > max) {
    return fail(`${label} must contain between ${min} and ${max} items.`);
  }

  const normalized: string[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const item = readString(value[index], `${label}[${index + 1}]`, { min: 1, max: 220 });
    if (!item.success) {
      return item;
    }
    normalized.push(item.data);
  }

  return ok(normalized);
}

function readDateLabel(value: unknown, label: string): ValidationResult<string> {
  const parsed = readString(value, label, { min: 7, max: 10 });
  if (!parsed.success) {
    return parsed;
  }
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(parsed.data)) {
    return fail(`${label} must use YYYY-MM or YYYY-MM-DD.`);
  }

  const normalized = /^\d{4}-\d{2}$/.test(parsed.data) ? `${parsed.data}-01` : parsed.data;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return fail(`${label} must be a real calendar date.`);
  }

  return ok(parsed.data);
}

function readGoals(value: unknown): ValidationResult<SavingsGoal[]> {
  if (!Array.isArray(value)) {
    return fail("goals must be an array.");
  }
  if (value.length > 5) {
    return fail("goals must contain 5 items or fewer.");
  }

  const goals: SavingsGoal[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    if (!isPlainObject(item)) {
      return fail(`goals[${index + 1}] must be an object.`);
    }

    const name = readString(item.name, `goals[${index + 1}].name`, { min: 1, max: 60 });
    if (!name.success) return name;
    const targetAmount = readNumber(item.targetAmount, `goals[${index + 1}].targetAmount`, { min: 1, max: 1_000_000 });
    if (!targetAmount.success) return targetAmount;
    const currentAmount = readNumber(item.currentAmount, `goals[${index + 1}].currentAmount`, { min: 0, max: 1_000_000 });
    if (!currentAmount.success) return currentAmount;
    if (currentAmount.data > targetAmount.data) {
      return fail(`goals[${index + 1}].currentAmount cannot exceed targetAmount.`);
    }
    const targetDate = readDateLabel(item.targetDate, `goals[${index + 1}].targetDate`);
    if (!targetDate.success) return targetDate;

    goals.push({
      name: name.data,
      targetAmount: targetAmount.data,
      currentAmount: currentAmount.data,
      targetDate: targetDate.data,
    });
  }

  return ok(goals);
}

function readHabits(value: unknown): ValidationResult<FinancialHabits> {
  if (!isPlainObject(value)) {
    return fail("habits must be an object.");
  }

  const impulseSpending = readEnum(value.impulseSpending, "habits.impulseSpending", SEVERITIES);
  if (!impulseSpending.success) return impulseSpending;
  const tracksSpending = readBoolean(value.tracksSpending, "habits.tracksSpending");
  if (!tracksSpending.success) return tracksSpending;
  const emergencyFundMonths = readNumber(value.emergencyFundMonths, "habits.emergencyFundMonths", { min: 0, max: 24 });
  if (!emergencyFundMonths.success) return emergencyFundMonths;
  const debtStress = readEnum(value.debtStress, "habits.debtStress", SEVERITIES);
  if (!debtStress.success) return debtStress;
  const confidence = readNumber(value.confidence, "habits.confidence", { min: 1, max: 5 });
  if (!confidence.success) return confidence;
  const paydaySplurges = readBoolean(value.paydaySplurges, "habits.paydaySplurges");
  if (!paydaySplurges.success) return paydaySplurges;

  return ok({
    impulseSpending: impulseSpending.data,
    tracksSpending: tracksSpending.data,
    emergencyFundMonths: emergencyFundMonths.data,
    debtStress: debtStress.data,
    confidence: confidence.data,
    paydaySplurges: paydaySplurges.data,
  });
}

export function parseFinancialProfile(value: unknown): ValidationResult<FinancialProfile> {
  if (!isPlainObject(value)) {
    return fail("financial profile must be an object.");
  }

  const name = readString(value.name, "name", { min: 1, max: 60 });
  if (!name.success) return name;
  const stage = readEnum(value.stage, "stage", LIFE_STAGES);
  if (!stage.success) return stage;
  const monthlyIncome = readNumber(value.monthlyIncome, "monthlyIncome", { min: 0, max: 100_000 });
  if (!monthlyIncome.success) return monthlyIncome;
  const fixedExpenses = readNumber(value.fixedExpenses, "fixedExpenses", { min: 0, max: 100_000 });
  if (!fixedExpenses.success) return fixedExpenses;
  const variableExpenses = readNumber(value.variableExpenses, "variableExpenses", { min: 0, max: 100_000 });
  if (!variableExpenses.success) return variableExpenses;
  const debtPayments = readNumber(value.debtPayments, "debtPayments", { min: 0, max: 100_000 });
  if (!debtPayments.success) return debtPayments;
  const currentSavings = readNumber(value.currentSavings, "currentSavings", { min: 0, max: 1_000_000 });
  if (!currentSavings.success) return currentSavings;
  const savingsRateGoal = readNumber(value.savingsRateGoal, "savingsRateGoal", { min: 0, max: 100 });
  if (!savingsRateGoal.success) return savingsRateGoal;
  const goals = readGoals(value.goals ?? []);
  if (!goals.success) return goals;
  const habits = readHabits(value.habits);
  if (!habits.success) return habits;
  const concern = readString(value.concern, "concern", { min: 1, max: 280 });
  if (!concern.success) return concern;

  return ok({
    name: name.data,
    stage: stage.data,
    monthlyIncome: monthlyIncome.data,
    fixedExpenses: fixedExpenses.data,
    variableExpenses: variableExpenses.data,
    debtPayments: debtPayments.data,
    currentSavings: currentSavings.data,
    savingsRateGoal: savingsRateGoal.data,
    goals: goals.data,
    habits: habits.data,
    concern: concern.data,
  });
}

function validateAnalysis(value: unknown): ValidationResult<Analysis> {
  if (!isPlainObject(value)) {
    return fail("analysis must be an object.");
  }

  const summary = readString(value.summary, "analysis.summary", { min: 1, max: 800 });
  if (!summary.success) return summary;
  const coachMessage = readString(value.coachMessage, "analysis.coachMessage", { min: 1, max: 500 });
  if (!coachMessage.success) return coachMessage;
  const disclaimer = readString(value.disclaimer, "analysis.disclaimer", { min: 1, max: 240 });
  if (!disclaimer.success) return disclaimer;
  const budgetAdvice = readStringArray(value.budgetAdvice, "analysis.budgetAdvice", { min: 1, max: 5 });
  if (!budgetAdvice.success) return budgetAdvice;

  if (!isPlainObject(value.savingsPlan)) {
    return fail("analysis.savingsPlan must be an object.");
  }
  const headline = readString(value.savingsPlan.headline, "analysis.savingsPlan.headline", { min: 1, max: 240 });
  if (!headline.success) return headline;
  const milestones = readStringArray(value.savingsPlan.milestones, "analysis.savingsPlan.milestones", { min: 1, max: 4 });
  if (!milestones.success) return milestones;
  const recommendedAutomation = readString(
    value.savingsPlan.recommendedAutomation,
    "analysis.savingsPlan.recommendedAutomation",
    { min: 1, max: 240 },
  );
  if (!recommendedAutomation.success) return recommendedAutomation;

  if (!isPlainObject(value.snapshot)) {
    return fail("analysis.snapshot must be an object.");
  }
  const emergencyFundMonths = readNumber(value.snapshot.emergencyFundMonths, "analysis.snapshot.emergencyFundMonths", { min: 0, max: 60 });
  if (!emergencyFundMonths.success) return emergencyFundMonths;
  const debtRatio = readNumber(value.snapshot.debtRatio, "analysis.snapshot.debtRatio", { min: 0, max: 1000 });
  if (!debtRatio.success) return debtRatio;

  if (!Array.isArray(value.budgetBreakdown) || value.budgetBreakdown.length === 0) {
    return fail("analysis.budgetBreakdown must contain at least one item.");
  }
  for (let index = 0; index < value.budgetBreakdown.length; index += 1) {
    const item = value.budgetBreakdown[index];
    if (!isPlainObject(item)) {
      return fail(`analysis.budgetBreakdown[${index + 1}] must be an object.`);
    }
    const label = readString(item.label, `analysis.budgetBreakdown[${index + 1}].label`, { min: 1, max: 40 });
    if (!label.success) return label;
    const amount = readNumber(item.amount, `analysis.budgetBreakdown[${index + 1}].amount`, { min: 0, max: 1_000_000 });
    if (!amount.success) return amount;
    const tone = readEnum(item.tone, `analysis.budgetBreakdown[${index + 1}].tone`, BUDGET_TONES);
    if (!tone.success) return tone;
  }

  if (!Array.isArray(value.riskAlerts)) {
    return fail("analysis.riskAlerts must be an array.");
  }
  for (let index = 0; index < value.riskAlerts.length; index += 1) {
    const alert = value.riskAlerts[index];
    if (!isPlainObject(alert)) {
      return fail(`analysis.riskAlerts[${index + 1}] must be an object.`);
    }
    const title = readString(alert.title, `analysis.riskAlerts[${index + 1}].title`, { min: 1, max: 80 });
    if (!title.success) return title;
    const detail = readString(alert.detail, `analysis.riskAlerts[${index + 1}].detail`, { min: 1, max: 220 });
    if (!detail.success) return detail;
    const severity = readEnum(alert.severity, `analysis.riskAlerts[${index + 1}].severity`, SEVERITIES);
    if (!severity.success) return severity;
  }

  if (!Array.isArray(value.savingsRoadmap)) {
    return fail("analysis.savingsRoadmap must be an array.");
  }
  for (let index = 0; index < value.savingsRoadmap.length; index += 1) {
    const goal = value.savingsRoadmap[index];
    if (!isPlainObject(goal)) {
      return fail(`analysis.savingsRoadmap[${index + 1}] must be an object.`);
    }
    const name = readString(goal.name, `analysis.savingsRoadmap[${index + 1}].name`, { min: 1, max: 80 });
    if (!name.success) return name;
    const currentAmount = readNumber(goal.currentAmount, `analysis.savingsRoadmap[${index + 1}].currentAmount`, { min: 0, max: 1_000_000 });
    if (!currentAmount.success) return currentAmount;
    const targetAmount = readNumber(goal.targetAmount, `analysis.savingsRoadmap[${index + 1}].targetAmount`, { min: 0, max: 1_000_000 });
    if (!targetAmount.success) return targetAmount;
    const monthlyContribution = readNumber(goal.monthlyContribution, `analysis.savingsRoadmap[${index + 1}].monthlyContribution`, { min: 0, max: 1_000_000 });
    if (!monthlyContribution.success) return monthlyContribution;
    const monthlyNeeded = readNumber(goal.monthlyNeeded, `analysis.savingsRoadmap[${index + 1}].monthlyNeeded`, { min: 0, max: 1_000_000 });
    if (!monthlyNeeded.success) return monthlyNeeded;
    const gap = readNumber(goal.gap, `analysis.savingsRoadmap[${index + 1}].gap`, { min: 0, max: 1_000_000 });
    if (!gap.success) return gap;
  }

  if (!isPlainObject(value.scenarioBaseline)) {
    return fail("analysis.scenarioBaseline must be an object.");
  }
  const scenarioLabel = readString(value.scenarioBaseline.label, "analysis.scenarioBaseline.label", { min: 1, max: 140 });
  if (!scenarioLabel.success) return scenarioLabel;
  const monthlySavingsBefore = readNumber(value.scenarioBaseline.monthlySavingsBefore, "analysis.scenarioBaseline.monthlySavingsBefore", { min: 0, max: 1_000_000 });
  if (!monthlySavingsBefore.success) return monthlySavingsBefore;
  const monthlySavingsAfter = readNumber(value.scenarioBaseline.monthlySavingsAfter, "analysis.scenarioBaseline.monthlySavingsAfter", { min: 0, max: 1_000_000 });
  if (!monthlySavingsAfter.success) return monthlySavingsAfter;
  const projectedSavingsIn6Months = readNumber(value.scenarioBaseline.projectedSavingsIn6Months, "analysis.scenarioBaseline.projectedSavingsIn6Months", { min: 0, max: 1_000_000 });
  if (!projectedSavingsIn6Months.success) return projectedSavingsIn6Months;
  const goalEtaShiftMonths = readNumber(value.scenarioBaseline.goalEtaShiftMonths, "analysis.scenarioBaseline.goalEtaShiftMonths", { min: 0, max: 240 });
  if (!goalEtaShiftMonths.success) return goalEtaShiftMonths;
  const explanation = readString(value.scenarioBaseline.explanation, "analysis.scenarioBaseline.explanation", { min: 1, max: 280 });
  if (!explanation.success) return explanation;
  const recommendedMove = readString(value.scenarioBaseline.recommendedMove, "analysis.scenarioBaseline.recommendedMove", { min: 1, max: 220 });
  if (!recommendedMove.success) return recommendedMove;

  return ok({
    ...(value as Partial<Analysis>),
    summary: summary.data,
    coachMessage: coachMessage.data,
    disclaimer: disclaimer.data,
    budgetAdvice: budgetAdvice.data,
    savingsPlan: {
      headline: headline.data,
      milestones: milestones.data,
      recommendedAutomation: recommendedAutomation.data,
    },
    snapshot: {
      ...(value.snapshot as Record<string, unknown>),
      emergencyFundMonths: emergencyFundMonths.data,
      debtRatio: debtRatio.data,
    },
  } as Analysis);
}

export function parseAnalyzeRequest(value: unknown): ValidationResult<{ profile: FinancialProfile }> {
  if (!isPlainObject(value)) {
    return fail("Request body must be a JSON object.");
  }
  const profile = parseFinancialProfile(value.profile);
  if (!profile.success) {
    return fail(`Invalid financial profile: ${profile.error}`);
  }
  return ok({ profile: profile.data });
}

export function parseScenarioRequest(
  value: unknown,
): ValidationResult<{ profile: FinancialProfile; saveBoostPercent: number; expenseTrimPercent: number }> {
  if (!isPlainObject(value)) {
    return fail("Request body must be a JSON object.");
  }

  const profile = parseFinancialProfile(value.profile);
  if (!profile.success) {
    return fail(`Invalid financial profile: ${profile.error}`);
  }

  const saveBoostPercent = readNumber(value.saveBoostPercent ?? 20, "saveBoostPercent", { min: 0, max: 100 });
  if (!saveBoostPercent.success) return saveBoostPercent;
  const expenseTrimPercent = readNumber(value.expenseTrimPercent ?? 5, "expenseTrimPercent", { min: 0, max: 100 });
  if (!expenseTrimPercent.success) return expenseTrimPercent;

  return ok({
    profile: profile.data,
    saveBoostPercent: saveBoostPercent.data,
    expenseTrimPercent: expenseTrimPercent.data,
  });
}

export function parseChatRequest(
  value: unknown,
): ValidationResult<{ profile: FinancialProfile; analysis: Analysis; question: string; history: ChatMessage[] }> {
  if (!isPlainObject(value)) {
    return fail("Request body must be a JSON object.");
  }

  const profile = parseFinancialProfile(value.profile);
  if (!profile.success) {
    return fail(`Invalid financial profile: ${profile.error}`);
  }

  const analysis = validateAnalysis(value.analysis);
  if (!analysis.success) {
    return fail(`Invalid analysis context: ${analysis.error}`);
  }

  const question = readString(value.question, "question", { min: 1, max: 320 });
  if (!question.success) return question;

  if (value.history !== undefined && !Array.isArray(value.history)) {
    return fail("history must be an array.");
  }

  const history: ChatMessage[] = [];
  for (const [index, item] of ((value.history as unknown[]) ?? []).entries()) {
    if (!isPlainObject(item)) {
      return fail(`history[${index + 1}] must be an object.`);
    }
    const role = readEnum(item.role, `history[${index + 1}].role`, CHAT_ROLES);
    if (!role.success) return role;
    const content = readString(item.content, `history[${index + 1}].content`, { min: 1, max: 400 });
    if (!content.success) return content;
    history.push({ role: role.data, content: content.data });
  }

  if (history.length > 12) {
    return fail("history must contain 12 messages or fewer.");
  }

  return ok({
    profile: profile.data,
    analysis: analysis.data,
    question: question.data,
    history,
  });
}
