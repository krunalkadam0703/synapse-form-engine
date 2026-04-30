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

  it('should index API dependencies from queryParams (multi) and queryParam (legacy)', () => {
    const fields: IFieldConfig[] = [
      {
        id: 'city',
        type: 'select',
        label: 'City',
        remoteSource: {
          url: '/api/cities',
          method: 'GET',
          queryParams: {
            countryId: 'country',
            stateId: 'state',
          },
        },
      },
      {
        id: 'zip',
        type: 'text',
        label: 'Zip',
        remoteSource: {
          url: '/api/zip',
          method: 'GET',
          queryParam: 'city',
        },
      },
    ];

    const map = DependencyIndexer.build(fields);

    expect(map['country']).toContainEqual({ targetFieldId: 'city', type: 'api' });
    expect(map['state']).toContainEqual({ targetFieldId: 'city', type: 'api' });
    expect(map['city']).toContainEqual({ targetFieldId: 'zip', type: 'api' });
  });
});