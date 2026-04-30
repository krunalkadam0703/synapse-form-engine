import { IFieldConfig, DependencyMap } from '../types';
import { FormulaEngine } from './FormulaEngine';

export class DependencyIndexer {
  private static engine = new FormulaEngine();

  public static build(fields: IFieldConfig[]): DependencyMap {
    const map: DependencyMap = {};
    debugger;

    const add = (sourceId: string, targetId: string, type: 'calculation' | 'api') => {
      if (!map[sourceId]) map[sourceId] = [];
      if (!map[sourceId].some(d => d.targetFieldId === targetId && d.type === type)) {
        map[sourceId].push({ targetFieldId: targetId, type });
      }
    };

    fields.forEach((field) => {
      // 1. Index Math Dependencies (Formula Parsing)
      if (field.calculation?.formula) {
        const sources = this.engine.getVariables(field.calculation.formula);
        sources.forEach(src => add(src, field.id, 'calculation'));
      }

      // 2. Index API Dependencies (Multi-Param & Legacy support)
      const remote = field.remoteSource;
      if (remote) {
        // Multi-dependency support: record format { "apiParam": "fieldId" }
        if (remote.queryParams) {
          Object.values(remote.queryParams).forEach((sourceFieldId) => {
            add(sourceFieldId, field.id, 'api');
          });
        }
        
        // Legacy support for single queryParam if it exists on the object
        const legacyParam = (remote as any).queryParam;
        if (legacyParam) {
          add(legacyParam, field.id, 'api');
        }
      }
    }); // End of fields.forEach

    console.log('DependencyMap', map);
    return map;
  }
}