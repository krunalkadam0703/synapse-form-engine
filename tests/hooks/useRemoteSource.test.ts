import { describe, expect, it } from 'vitest';
import { useRemoteSource } from '../../src/hooks/useRemoteSource';

describe('useRemoteSource export', () => {
  it('is exported as a function', () => {
    expect(typeof useRemoteSource).toBe('function');
  });
});
