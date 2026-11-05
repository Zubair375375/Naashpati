import { simulateBreakEven } from "../services/financialService.js";

describe("simulateBreakEven", () => {
  test("handles zero revenue without creating an invalid break-even target", () => {
    const result = simulateBreakEven({
      sellingPrice: 0,
      productCost: 0,
      packagingCost: 0,
      deliveryCost: 0,
      paymentFees: 0,
      fixedMonthlyExpenses: 1000,
      expectedMonthlyOrders: 10,
    });

    expect(result.breakEvenRevenue).toBe(0);
    expect(result.contributionMarginRatio).toBe(0);
    expect(result.expectedOperatingProfit).toBe(-1000);
  });

  test("treats zero contribution margin as a loss scenario instead of a valid break-even", () => {
    const result = simulateBreakEven({
      sellingPrice: 100,
      productCost: 100,
      packagingCost: 0,
      deliveryCost: 0,
      paymentFees: 0,
      fixedMonthlyExpenses: 500,
      expectedMonthlyOrders: 10,
    });

    expect(result.contributionPerOrder).toBe(0);
    expect(result.breakEvenOrders).toBe(0);
    expect(result.expectedOperatingProfit).toBe(-500);
  });

  test("preserves negative contribution when cost exceeds selling price", () => {
    const result = simulateBreakEven({
      sellingPrice: 80,
      productCost: 120,
      packagingCost: 10,
      deliveryCost: 0,
      paymentFees: 5,
      fixedMonthlyExpenses: 1000,
      expectedMonthlyOrders: 20,
    });

    expect(result.variableCostPerOrder).toBe(135);
    expect(result.contributionPerOrder).toBe(-55);
    expect(result.contributionMarginRatio).toBeCloseTo(-0.6875, 4);
    expect(result.expectedOperatingProfit).toBe(-2100);
  });
});
