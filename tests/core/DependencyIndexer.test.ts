import { describe, it, expect } from 'vitest';
import { DependencyIndexer } from '../../src/core/DependencyIndexer';
import { IFieldConfig } from '../../src/types';

describe('DependencyIndexer Logic', () => {
  
  it('should map math formula dependencies correctly', () => {
    const fields: Partial<IFieldConfig>[] = [
      { 
        id: 'total', 
        calculation: { formula: 'rate * qty + tax' } 
      }
    ];

    const map = DependencyIndexer.build(fields as IFieldConfig[]);

    // Check if source fields point to the target
    expect(map['rate']).toContainEqual({ targetFieldId: 'total', type: 'calculation' });
    expect(map['qty']).toContainEqual({ targetFieldId: 'total', type: 'calculation' });
    expect(map['tax']).toContainEqual({ targetFieldId: 'total', type: 'calculation' });
  });

  it('should map API queryParam dependencies correctly', () => {
    const fields: Partial<IFieldConfig>[] = [
      { 
        id: 'city_list', 
        options: { 
          source: 'remote', 
          remote: { url: '/api/cities', queryParam: 'country_id' } 
        } 
      }
    ];

    const map = DependencyIndexer.build(fields as IFieldConfig[]);

    expect(map['country_id']).toContainEqual({ 
      targetFieldId: 'city_list', 
      type: 'api' 
    });
  });

  it('should ignore math constants and functions', () => {
    const fields: Partial<IFieldConfig>[] = [
      { 
        id: 'rounded_val', 
        calculation: { formula: 'Math.round(price * PI)' } 
      }
    ];

    const map = DependencyIndexer.build(fields as IFieldConfig[]);

    // 'price' should be a dependency, but 'Math' and 'PI' should be ignored
    expect(map['price']).toBeDefined();
    expect(map['Math']).toBeUndefined();
    expect(map['PI']).toBeUndefined();
  });

  it('should prevent duplicate dependency entries', () => {
    const fields: Partial<IFieldConfig>[] = [
      { 
        id: 'tax_total', 
        calculation: { formula: 'subtotal * tax_rate' } 
      },
      { 
        id: 'tax_total', // Same field, redundant rule
        calculation: { formula: 'subtotal * tax_rate' } 
      }
    ];

    const map = DependencyIndexer.build(fields as IFieldConfig[]);
    
    // Should only have one entry for subtotal -> tax_total
    const dependencies = map['subtotal'].filter(d => d.targetFieldId === 'tax_total');
    expect(dependencies.length).toBe(1);
  });

  it('should handle multiple target fields for one source', () => {
    const fields: Partial<IFieldConfig>[] = [
      { id: 'tax', calculation: { formula: 'subtotal * 0.1' } },
      { id: 'total', calculation: { formula: 'subtotal + 50' } }
    ];

    const map = DependencyIndexer.build(fields as IFieldConfig[]);

    expect(map['subtotal']).toEqual(
      expect.arrayContaining([
        { targetFieldId: 'tax', type: 'calculation' },
        { targetFieldId: 'total', type: 'calculation' }
      ])
    );
  });
});


