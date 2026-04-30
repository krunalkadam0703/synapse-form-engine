import { describe, expect, it } from 'vitest';
import * as Synapse from '../src/index';

describe('package entry exports', () => {
  it('exports core modules', () => {
    expect(Synapse.Broker).toBeDefined();
    expect(Synapse.Registry).toBeDefined();
    expect(Synapse.ValidatorResolver).toBeDefined();
    expect(Synapse.DependencyIndexer).toBeDefined();
    expect(Synapse.EffectHandler).toBeDefined();
  });

  it('exports react modules and hooks', () => {
    expect(Synapse.SynapseProvider).toBeDefined();
    expect(Synapse.useSynapse).toBeDefined();
    expect(Synapse.SynapseForm).toBeDefined();
    expect(Synapse.SmartField).toBeDefined();
    expect(Synapse.useRemoteSource).toBeDefined();
  });
});
