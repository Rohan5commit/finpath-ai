import { describe, it, expect } from 'vitest';
import { buildHeuristicAnalysis } from './finance';

describe('Finance Engine', () => {
  it('builds a complete heuristic analysis', () => {
    const profile = {
      name: 'Maya',
      monthlyIncome: 5000,
      fixedExpenses: 1500,
      variableExpenses: 500,
      debtPayments: 200,
      currentSavings: 1000,
      savingsRateGoal: 20,
      goals: [],
      habits: {
        tracksSpending: true,
        impulseSpending: 'low',
        paydaySplurges: false,
        debtStress: 'low',
        confidence: 4,
        emergencyFundMonths: 1
      }
    };
    const analysis = buildHeuristicAnalysis(profile as any);
    expect(analysis.healthScore).toBeGreaterThanOrEqual(18);
    expect(analysis.healthScore).toBeLessThanOrEqual(95);
    expect(analysis.snapshot.monthlyIncome).toBe(5000);
    expect(analysis.budgetBreakdown).toHaveLength(4);
    expect(analysis.disclaimer).toBeDefined();
  });
});
