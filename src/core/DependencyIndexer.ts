import { IFieldConfig, DependencyMap, DependencyType } from '../types';

export class DependencyIndexer {
  /**
   * builds a map: { [sourceId]: [{ targetFieldId, type }] }
   * Tells the engine: "When sourceId changes, update targetFieldId using 'type' logic."
   */
  public static build(fields: IFieldConfig[]): DependencyMap {
    const map: DependencyMap = {};

    const addDependency = (
      sourceId: string,
      targetFieldId: string,
      type: DependencyType
    ) => {
      if (!map[sourceId]) map[sourceId] = [];

      // Avoid duplicate registrations
      if (!map[sourceId].some(d => d.targetFieldId === targetFieldId && d.type === type)) {
        map[sourceId].push({ targetFieldId, type });
      }
    };

    fields.forEach((field) => {
      // 🔹 1. Handle Math/Formula dependencies
      if (field.calculation?.formula) {
        const sources = this.extractVariables(field.calculation.formula);
        sources.forEach((sourceId) => {
          addDependency(sourceId, field.id, 'calculation');
        });
      }

      // 🔹 2. Handle API/Remote dependencies (e.g., cascading selects)
      if (field.options?.source === 'remote' && field.options.remote?.queryParam) {
        addDependency(field.options.remote.queryParam, field.id, 'api');
      }
    });

    return map;
  }

  /**
   * Identifies variable names within a formula string.
   */
  private static extractVariables(formula: string): string[] {
    const regex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    const matches = formula.match(regex) || [];
    const ignored = new Set(['Math', 'PI', 'round', 'ceil', 'floor', 'abs', 'sin', 'cos', 'tan']);

    // Return unique variables only, filtering out constants
    return [...new Set(matches.filter(m => !ignored.has(m)))];
  }
}