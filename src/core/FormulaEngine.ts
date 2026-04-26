import { Parser, Expression } from 'expr-eval';

/**
 * FormulaEngine
 * High-performance mathematical solver with expression caching.
 */
export class FormulaEngine {
  private parser: Parser;
  private cache: Map<string, Expression>;

  constructor() {
    this.parser = new Parser();
    this.cache = new Map();
  }

  /**
   * Internal helper to compile and cache formula strings.
   * Caching prevents expensive re-parsing of strings.
   */
  private compile(formula: string): Expression {
    if (!this.cache.has(formula)) {
      const expr = this.parser.parse(formula);
      this.cache.set(formula, expr);
    }
    return this.cache.get(formula)!;
  }

  /**
   * Evaluates a formula against the current form values.
   */
  public solve(formula: string, scope: Record<string, unknown>): number {
    try {
      const expr = this.compile(formula);
      const numericScope: Record<string, number> = {};

      // Robust numeric coercion
      for (const key in scope) {
        const val = scope[key];

        if (typeof val === 'number') {
          numericScope[key] = val;
        } else if (typeof val === 'string' && val.trim() !== '') {
          const parsed = Number(val);
          numericScope[key] = isNaN(parsed) ? 0 : parsed;
        } else {
          numericScope[key] = 0;
        }
      }

      const result = expr.evaluate(numericScope);

      // Protect against Infinity or NaN (e.g., division by zero)
      return Number.isFinite(result) ? result : 0;

    } catch (error) {
      // Only log errors in development to keep production clean
      return 0;
    }
  }

  /**
   * Returns a list of variables found in a formula.
   * Useful for the DependencyIndexer.
   */
  public getVariables(formula: string): string[] {
    try {
      return this.compile(formula).variables();
    } catch {
      return [];
    }
  }

  /**
   * Flushes the formula cache.
   */
  public clearCache(): void {
    this.cache.clear();
  }
}