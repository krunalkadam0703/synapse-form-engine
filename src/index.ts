/**
 * Synapse Form Engine - Headless Package Entry
 * Developed for high-concurrency and reactive data-driven forms.
 */

// 1. Export the Blueprint and Logic Types
export * from './types';

// 2. Export the Core "Nervous System"
// These allow the developer to interact with the engine outside of React if needed.
export { Broker } from './core/Broker';
export { Registry } from './core/ComponentRegistry';
export { ValidatorResolver } from './core/ValidatorResolver';
export { DependencyIndexer } from './core/DependencyIndexer';
export { EffectHandler } from './core/EffectHandler';

// 3. Export React Components (The Visual Bridge)
// SynapseForm is the logical wrapper, SmartField is the individual field injector.
export { SynapseProvider, useSynapse } from './components/SynapseProvider';
export { SynapseForm } from './components/SynapseForm';
export { SmartField } from './components/SmartField';

// 4. Export Hooks for Custom Component Development
// useRemoteSource is vital for developers building their own dynamic select boxes.
export { useRemoteSource } from './hooks/useRemoteSource';