import { describe, it, expect, beforeEach } from 'vitest';
import { FormulaEngine } from '../../src/core/FormulaEngine';

describe('FormulaEngine', () => {
  let engine: FormulaEngine;

  beforeEach(() => {
    engine = new FormulaEngine();
  });

//   ### 1. Basic Arithmetic & Precision
  it('should solve standard manufacturing math', () => {
    const scope = { rate: 150, qty: 2.5, discount: 10 };
    // (150 * 2.5) - 10 = 365
    expect(engine.solve('(rate * qty) - discount', scope)).toBe(365);
  });

//   ### 2. Numeric Coercion (The "Safe-Guard" Test)
  it('should handle mixed string and number inputs correctly', () => {
    const scope = { 
      price: "100.50", 
      tax: 0.18, 
      empty: "", 
      nullVal: null 
    };
    
    // 100.50 * 0.18 = 18.09
    expect(engine.solve('price * tax', scope as any)).toBeCloseTo(18.09, 2);
    // Should treat empty/null as 0
    expect(engine.solve('price + empty + nullVal', scope as any)).toBe(100.50);
  });

//   ### 3. Safety & Edge Cases
  it('should return 0 for division by zero instead of Infinity', () => {
    const scope = { total: 500, count: 0 };
    expect(engine.solve('total / count', scope)).toBe(0);
  });

  it('should return 0 for malformed formulas', () => {
    
    expect(engine.solve('invalid + @#$', {})).toBe(0);
    // @ts-expect-error
    expect(engine.solve(null, {})).toBe(0);
  });

//   ### 4. Cache & Variable Extraction
  it('should correctly extract variables for the Indexer', () => {
    const formula = 'PI * (radius ^ 2) + height';
    const vars = engine.getVariables(formula);
    
    expect(vars).toContain('radius');
    expect(vars).toContain('height');
    expect(vars).not.toContain('PI'); // PI is a built-in constant
  });

  it('should allow clearing the cache', () => {
    engine.solve('a + b', { a: 1, b: 2 });
    // This is mostly for coverage, but ensures the method exists
    expect(() => engine.clearCache()).not.toThrow();
  });

//   ### 5. Complex Logical Expressions
  it('should handle logical operators (if needed)', () => {
    const scope = { weight: 50 };
    // expr-eval supports ternary-like logic: condition ? true : false
    // Note: expr-eval uses 'if(cond, true, false)'
    const formula = 'if(weight > 20, 100, 50)';
    expect(engine.solve(formula, scope)).toBe(100);
  });
});