import { describe, it, expect } from 'vitest';
import { ValidatorResolver } from '../../src/core/ValidatorResolver';
import { ISynapseConfig } from '../../src/types';

describe('ValidatorResolver (Cross-field Guard)', () => {
  
  it('should fail validation when Selling Price < Cost Price', () => {
    const config: ISynapseConfig = {
      formMeta: { formId: "Test Form" ,version: "1.0" },
      fields: [
        { id: 'cost_price', type: 'number', label: 'Cost' },
        { 
          id: 'selling_price', 
          type: 'number', 
          label: 'Sell',
          crossField: [{ targetId: 'cost_price', operator: '>', message: 'Cannot sell at loss' }]
        }
      ]
    };

    const schema = ValidatorResolver.buildSchema(config.fields);

    // Test: Cost 100, Sell 80 (Invalid)
    const result = schema.safeParse({ cost_price: 100, selling_price: 80 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Cannot sell at loss');
      expect(result.error.issues[0].path).toContain('selling_price');
    }

    // Test: Cost 100, Sell 120 (Valid)
    expect(schema.safeParse({ cost_price: 100, selling_price: 120 }).success).toBe(true);
  });

  it('should handle optionality correctly', () => {
    const config: ISynapseConfig = {
      formMeta: { formId: "Optional Test" ,version: "1.0" },
      fields: [
        { id: 'optional_field', type: 'text', label: 'Optional' }
      ]
    };

    const schema = ValidatorResolver.buildSchema(config.fields);
    
    // Should pass even if the field is missing from data
    expect(schema.safeParse({}).success).toBe(true);
  });
});