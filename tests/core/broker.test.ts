import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Broker } from '../../src/core/Broker';

describe('Typed Broker Engine', () => {

  // ✅ Prevent cross-test pollution
  beforeEach(() => {
    Broker.clear();
  });

  it('should emit and receive field:change event', () => {
    const spy = vi.fn();

    Broker.subscribe('field:change', spy);

    const payload = { fieldId: 'price', value: 500 };
    Broker.emit('field:change', payload);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(payload);
  });

  it('should support multiple subscribers for same event', () => {
    const spy1 = vi.fn();
    const spy2 = vi.fn();

    Broker.subscribe('field:change', spy1);
    Broker.subscribe('field:change', spy2);

    const payload = { fieldId: 'qty', value: 10 };
    Broker.emit('field:change', payload);

    expect(spy1).toHaveBeenCalledWith(payload);
    expect(spy2).toHaveBeenCalledWith(payload);
  });

  it('should not call handler after unsubscribe', () => {
    const spy = vi.fn();

    const unsubscribe = Broker.subscribe('field:reset', spy);
    unsubscribe();

    Broker.emit('field:reset', { fieldId: 'qty' });

    expect(spy).not.toHaveBeenCalled();
  });

  it('should handle multiple emits correctly', () => {
    const spy = vi.fn();

    Broker.subscribe('field:change', spy);

    Broker.emit('field:change', { fieldId: 'a', value: 1 });
    Broker.emit('field:change', { fieldId: 'b', value: 2 });

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should clear all listeners', () => {
    const spy = vi.fn();

    Broker.subscribe('field:change', spy);

    Broker.clear();

    Broker.emit('field:change', { fieldId: 'x', value: 100 });

    expect(spy).not.toHaveBeenCalled();
  });

});