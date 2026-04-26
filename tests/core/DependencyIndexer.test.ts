import { describe, it, expect } from 'vitest';
import { DependencyIndexer } from '../../src/core/DependencyIndexer';
import { IFieldConfig } from '../../src/types';

describe('DependencyIndexer with FormulaEngine', () => {
  
  it('should extract complex math dependencies correctly', () => {
    const fields: Partial<IFieldConfig>[] = [
      { 
        id: 'final_cost', 
        calculation: { formula: '(base_rate * qty) + (shipping / weight)' } 
      }
    ];

    const map = DependencyIndexer.build(fields as IFieldConfig[]);

    const expectedSources = ['base_rate', 'qty', 'shipping', 'weight'];
    
    expectedSources.forEach(source => {
      expect(map[source]).toContainEqual({ 
        targetFieldId: 'final_cost', 
        type: 'calculation' 
      });
    });
  });

  it('should distinguish between calculation and api triggers', () => {
    const fields: Partial<IFieldConfig>[] = [
      { 
        id: 'tax', 
        calculation: { formula: 'subtotal * 0.18' } 
      },
      { 
        id: 'state_list', 
        options: { 
          source: 'remote', 
          remote: { url: '/states', queryParam: 'country_id' } 
        } 
      }
    ];

    const map = DependencyIndexer.build(fields as IFieldConfig[]);

    expect(map['subtotal']).toContainEqual({ 
        targetFieldId: 'tax', 
        type: 'calculation' 
    });
    
    expect(map['country_id']).toContainEqual({ 
        targetFieldId: 'state_list', 
        type: 'api' 
    });
  });

  it('should ignore static numbers and built-in constants', () => {
    const fields: Partial<IFieldConfig>[] = [
      { 
        id: 'area', 
        calculation: { formula: 'PI * (radius ^ 2)' } 
      }
    ];

    const map = DependencyIndexer.build(fields as IFieldConfig[]);

    expect(map['radius']).toBeDefined();
    expect(map['PI']).toBeUndefined(); // Should be ignored as it's a math constant
  });
});