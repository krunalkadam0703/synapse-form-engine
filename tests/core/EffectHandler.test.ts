import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EffectHandler } from '../../src/core/EffectHandler';
import { Broker } from '../../src/core/Broker';
import { ISynapseConfig } from '../../src/types';

describe('EffectHandler', () => {
  beforeEach(() => {
    Broker.clear();
  });

  it('should emit namespaced api fetch event for dependent remote fields', () => {
    const config: ISynapseConfig = {
      formMeta: { formId: 'api-fetch-test', version: '1.0.0' },
      fields: [
        { id: 'department_id', type: 'number', label: 'Department' },
        {
          id: 'employee_id',
          type: 'select',
          label: 'Employee',
          options: {
            source: 'remote',
            remote: {
              url: '/api/employees',
              queryParam: 'department_id'
            }
          }
        }
      ]
    };

    const map = {
      department_id: [{ targetFieldId: 'employee_id', type: 'api' as const }]
    };

    const handler = new EffectHandler();
    const onFetch = vi.fn();
    const onLegacyFetch = vi.fn();
    const unsubscribeFetch = Broker.subscribe('api:fetch:employee_id', onFetch);
    const unsubscribeLegacyFetch = Broker.subscribe('api:fetch', onLegacyFetch);
    const unsubscribeOrchestrate = handler.orchestrate(
      config,
      map,
      () => ({}),
      vi.fn()
    );

    Broker.emit('field:change', { fieldId: 'department_id', value: 42 });

    expect(onFetch).toHaveBeenCalledTimes(1);
    expect(onFetch).toHaveBeenCalledWith({ triggerValue: 42 });
    expect(onLegacyFetch).not.toHaveBeenCalled();

    unsubscribeFetch();
    unsubscribeLegacyFetch();
    unsubscribeOrchestrate();
  });
});
