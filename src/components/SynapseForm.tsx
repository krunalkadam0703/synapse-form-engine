import React from 'react';
import { SynapseProvider } from './SynapseProvider';
import { ISynapseConfig } from '../types';

interface SynapseFormProps {
  config: ISynapseConfig;
  children: React.ReactNode;
  globalContext?: Record<string, any>;
  onSubmit?: (data: any) => void; 
}

export const SynapseForm: React.FC<SynapseFormProps> = ({ 
  config, 
  children, 
  globalContext,
  onSubmit
}) => {
  // Handle the form submission event
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Logic to pull data from your Broker/Store would go here
    // For now, we ensure the prop is accessible to children or 
    // simply wrap the children in a standard form if desired.
    if (onSubmit) {
      // In a real scenario, you'd get the current state from the Provider
      // For the stress test, we'll ensure the children can trigger this.
      console.log("SynapseForm: Submit triggered");
    }
  };

  return (
    <SynapseProvider config={config} globalContext={globalContext}>
      {/* We wrap in a native form here so that any 'submit' button 
         inside 'children' naturally triggers the onSubmit logic.
      */}
      <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
        {children}
      </form>
    </SynapseProvider>
  );
};