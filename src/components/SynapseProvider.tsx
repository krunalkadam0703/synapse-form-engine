import React, { createContext, useContext, useMemo, useEffect, useRef } from 'react';
import { useForm, FormProvider, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ISynapseConfig, DependencyMap } from '../types';
import { DependencyIndexer } from '../core/DependencyIndexer';
import { ValidatorResolver } from '../core/ValidatorResolver';
import { EffectHandler } from '../core/EffectHandler';

interface ISynapseContext {
  config: ISynapseConfig;
  dependencyMap: DependencyMap;
  methods: UseFormReturn<any>;
}

const SynapseContext = createContext<ISynapseContext | null>(null);

interface SynapseProviderProps {
  config: ISynapseConfig;
  children: React.ReactNode;
  globalContext?: Record<string, any>;
}

export const SynapseProvider: React.FC<SynapseProviderProps> = ({ 
  config, 
  children, 
  globalContext = {} 
}) => {
  // 1. Memoize logic: only rebuild if the field definitions change
  const { schema, dependencyMap } = useMemo(() => ({
    schema: ValidatorResolver.buildSchema(config.fields),
    dependencyMap: DependencyIndexer.build(config.fields)
  }), [config.fields]);

  // 2. Setup React Hook Form
  const methods = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: Object.fromEntries(
      config.fields.map(f => [f.id, f.defaultValue ?? ''])
    )
  });

  // 3. Persistent instance of the logic handler
  const handlerRef = useRef(new EffectHandler());

  // 4. Orchestrate calculations and API pulses
  useEffect(() => {
    const unsubscribe = handlerRef.current.orchestrate(
      config,
      dependencyMap,
      methods.getValues,
      methods.setValue,
      globalContext
    );
    return () => unsubscribe();
  }, [config, dependencyMap, globalContext]);

  return (
    <SynapseContext.Provider value={{ config, dependencyMap, methods }}>
      <FormProvider {...methods}>{children}</FormProvider>
    </SynapseContext.Provider>
  );
};

export const useSynapse = () => {
  const context = useContext(SynapseContext);
  if (!context) throw new Error("useSynapse must be used within SynapseProvider");
  return context;
};