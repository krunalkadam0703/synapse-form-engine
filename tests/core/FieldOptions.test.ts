import { describe, expect, it } from 'vitest';
import { normalizeFieldOptions } from '../../src/core/FieldOptions';

describe('normalizeFieldOptions', () => {
  it('returns direct array options as-is', () => {
    const options = [{ label: 'One', value: '1' }];
    expect(normalizeFieldOptions(options)).toEqual(options);
  });

  it('supports typed static format with data', () => {
    const options = {
      source: 'static' as const,
      data: [{ label: 'Two', value: '2' }],
    };
    expect(normalizeFieldOptions(options)).toEqual([{ label: 'Two', value: '2' }]);
  });

  it('supports legacy source array format', () => {
    const options = {
      source: [{ label: 'Legacy', value: 'L' }],
    };
    expect(normalizeFieldOptions(options)).toEqual([{ label: 'Legacy', value: 'L' }]);
  });

  it('returns empty array for missing/unknown formats', () => {
    expect(normalizeFieldOptions(undefined)).toEqual([]);
    expect(normalizeFieldOptions({ source: 'remote' })).toEqual([]);
  });
});
