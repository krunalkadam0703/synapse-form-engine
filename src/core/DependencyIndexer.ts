import { IFieldConfig, DependencyMap, DependencyType } from '../types';
import { FormulaEngine } from './FormulaEngine';

export class DependencyIndexer {
  private static engine = new FormulaEngine();

  /**
   * builds a map: { [sourceId]: [{ targetFieldId, type }] }
   */
  public static build(fields: IFieldConfig[]): DependencyMap {
    const map: DependencyMap = {};

    const addDependency = (
      sourceId: string,
      targetFieldId: string,
      type: DependencyType
    ) => {
      if (!map[sourceId]) map[sourceId] = [];

      if (!map[sourceId].some(d => d.targetFieldId === targetFieldId && d.type === type)) {
        map[sourceId].push({ targetFieldId, type });
      }
    };

    fields.forEach((field) => {
      // 🔹 1. Use the real FormulaEngine to extract variables
      if (field.calculation?.formula) {
        const sources = this.engine.getVariables(field.calculation.formula);
        sources.forEach((sourceId) => {
          addDependency(sourceId, field.id, 'calculation');
        });
      }

      // 🔹 2. Handle API/Remote dependencies
      if (field.options?.source === 'remote' && field.options.remote?.queryParam) {
        addDependency(field.options.remote.queryParam, field.id, 'api');
      }
    });

    return map;
  }
}