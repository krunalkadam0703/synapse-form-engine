import { IFieldConfig, DependencyMap } from '../types';
import { FormulaEngine } from './FormulaEngine';

export class DependencyIndexer {
  private static engine = new FormulaEngine();

  public static build(fields: IFieldConfig[]): DependencyMap {
    const map: DependencyMap = {};

    const add = (sourceId: string, targetId: string, type: 'calculation' | 'api') => {
      if (!map[sourceId]) map[sourceId] = [];
      if (!map[sourceId].some(d => d.targetFieldId === targetId && d.type === type)) {
        map[sourceId].push({ targetFieldId: targetId, type });
      }
    };

    fields.forEach((field) => {
      // Index math dependencies
      if (field.calculation?.formula) {
        const sources = this.engine.getVariables(field.calculation.formula);
        sources.forEach(src => add(src, field.id, 'calculation'));
      }
      // Index API dependencies
      if (field.options?.source === 'remote' && field.options.remote?.queryParam) {
        add(field.options.remote.queryParam, field.id, 'api');
      }
    });

    return map;
  }
}