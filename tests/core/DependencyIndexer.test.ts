import { describe, it, expect } from 'vitest';
import { DependencyIndexer } from '../../src/core/DependencyIndexer';
import { IFieldConfig } from '../../src/types';

describe('DependencyIndexer Intelligence', () => {
  it('should find all variables in a complex formula', () => {
    const fields: IFieldConfig[] = [
      { 
        id: 'bmi', 
        type: 'number', 
        label: 'BMI', 
        calculation: { formula: 'weight / (height * height)' } 
      }
    ];

    const map = DependencyIndexer.build(fields);

    // Changing weight should trigger BMI
    expect(map['weight']).toContainEqual({ targetFieldId: 'bmi', type: 'calculation' });
    // Changing height should trigger BMI
    expect(map['height']).toContainEqual({ targetFieldId: 'bmi', type: 'calculation' });
  });
});