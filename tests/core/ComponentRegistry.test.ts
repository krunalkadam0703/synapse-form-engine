import { describe, expect, it } from 'vitest';
import { Registry } from '../../src/core/ComponentRegistry';

describe('ComponentRegistry', () => {
  it('registers and returns a component by type', () => {
    const Dummy = () => null;
    Registry.register('unit-test-dummy', Dummy);
    expect(Registry.get('unit-test-dummy')).toBe(Dummy);
  });

  it('returns undefined for unknown type', () => {
    expect(Registry.get('unit-test-missing')).toBeUndefined();
  });
});
