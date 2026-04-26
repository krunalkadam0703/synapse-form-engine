import React from 'react';

export type SynapseComponent = React.ComponentType<any>;

class ComponentRegistry {
  private registry: Map<string, SynapseComponent> = new Map();

  public register(type: string, component: SynapseComponent) {
    this.registry.set(type, component);
  }

  public get(type: string): SynapseComponent | undefined {
    return this.registry.get(type);
  }
}

export const Registry = new ComponentRegistry();