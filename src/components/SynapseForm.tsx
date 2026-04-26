import React from 'react';
import { SynapseProvider } from './SynapseProvider';
import { ISynapseConfig } from '../types';

interface SynapseFormProps {
  config: ISynapseConfig;
  children: React.ReactNode;
  globalContext?: Record<string, any>;
}

/**
 * SynapseForm
 * Now purely a logical wrapper. The developer provides the 
 * <form> tag and layout as children.
 */
export const SynapseForm: React.FC<SynapseFormProps> = ({ 
  config, 
  children, 
  globalContext 
}) => {
  return (
    <SynapseProvider config={config} globalContext={globalContext}>
      {children}
    </SynapseProvider>
  );
};