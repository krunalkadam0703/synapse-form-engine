import { Broker } from './Broker';
import { FormulaEngine } from './FormulaEngine';
import { DependencyMap, ISynapseConfig } from '../types';

export class EffectHandler {
  private formulaEngine = new FormulaEngine();

  public orchestrate(
    config: ISynapseConfig,
    map: DependencyMap,
    getValues: () => Record<string, any>,
    setValue: (id: string, value: any, options?: any) => void,
    globalContext: Record<string, any> = {}
  ) {
    return Broker.subscribe('field:change', ({ fieldId, value }) => {
      const dependents = map[fieldId];

      if (dependents && dependents.length > 0) {
        dependents.forEach((dep) => {
          const targetField = config.fields.find((f) => f.id === dep.targetFieldId);
          if (!targetField) return;

          // 🔹 AUTOMATIC CALCULATION RIPPLE
          if (dep.type === 'calculation' && targetField.calculation) {
            const currentScope = { 
              ...globalContext, 
              ...getValues(), 
              [fieldId]: value 
            };
            
            const result = this.formulaEngine.solve(
              targetField.calculation.formula, 
              currentScope
            );

            setValue(dep.targetFieldId, result, { 
              shouldValidate: true, 
              shouldDirty: true 
            });
            
            // Broadcast the new value so its own dependents update
            Broker.emit('field:change', { 
              fieldId: dep.targetFieldId, 
              value: result 
            });
          }

          // 🔹 API FETCH TRIGGER
          if (dep.type === 'api') {
            Broker.emit('api:fetch', { 
              fetcherId: dep.targetFieldId, 
              params: { ...globalContext, [fieldId]: value } 
            });
          }
        });
      }
    });
  }
}