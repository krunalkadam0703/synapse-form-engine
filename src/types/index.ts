import React from 'react';

/**
 * 1. Validation Logic
 * Defines the rules that will be mapped to Zod validation chains.
 */
export interface IFieldValidation {
  rule: 
    | 'required' 
    | 'min' 
    | 'max' 
    | 'email' 
    | 'url' 
    | 'uuid' 
    | 'regex' 
    | 'minLength' 
    | 'maxLength';
  value?: any;      // Constraint value (e.g., 10 for maxLength)
  message?: string; // Custom error message displayed in UI
}

/**
 * 2. Mathematical Logic
 * Used by the formula engine to calculate real-time values.
 */
export interface IFieldCalculation {
  formula: string; // e.g., "(qty * price) * tax"
}

/**
 * 3. Network Logic
 * Used by the remote pulse handler to fetch a single value for a field.
 */
export interface IRemoteSource {
  url: string;        // e.g., "/api/v1/rates/{{vendorId}}"
  resultPath: string; // e.g., "data.rate"
}

/**
 * 4. Selection Logic (List of Dictionaries)
 * For Dropdowns, Radios, and Autocomplete components.
 */
export interface IFieldOption {
  label: string;      // Display text
  value: string | number; // Underlying data value
}

export interface IFieldOptions {
  source: 'static' | 'remote';
  // List of dictionaries for hardcoded options
  data?: IFieldOption[]; 
  remote?: {
    url: string;         // e.g., "/api/v1/materials?category={{categoryId}}"
    queryParam?: string;  // The field ID to watch/subscribe to
    mapResponse?: {
      labelKey: string;   // e.g., "material_name" maps to "label"
      valueKey: string;   // e.g., "material_id" maps to "value"
    };
  };
}

/**
 * 5. Field Configuration
 * The primary blueprint for an individual form field.
 */
export interface IFieldConfig {
  id: string;
  type: string;        // e.g., "text", "number", "select", "combobox"
  label: string;
  placeholder?: string;
  defaultValue?: any;
  readOnly?: boolean;
  options?: IFieldOptions; // Handles the List of Dictionaries (Static or Remote)
  validation?: IFieldValidation[];
  calculation?: IFieldCalculation;
  remoteSource?: IRemoteSource;
}

/**
 * 6. Form Metadata
 */
export interface IFormMeta {
  formId: string;
  version: string;
}

/**
 * 7. Root Configuration
 * The full JSON schema required by the engine.
 */
export interface ISynapseConfig {
  formMeta: IFormMeta;
  fields: IFieldConfig[];
}

/**
 * 8. UI Registry
 * Maps the JSON 'type' string to a physical React Component.
 */
export type SynapseRegistry = Record<string, React.ComponentType<any>>;


/**
 * 9. Broker Event Map
 * Defines every type of "Pulse" that can travel through the engine.
 */
export type BrokerEvents = {
  // Triggered whenever a user types or selects a value
  'field:change': {
    fieldId: string;
    value: unknown;
  };

  // Triggered to clear a field's value or error
  'field:reset': {
    fieldId: string;
  };

  // Triggered when a calculation needs to run
  'calc:trigger': {
    calcId: string;
    inputs: Record<string, unknown>;
  };

  // Triggered to start an API request for dynamic options
  'api:fetch': {
    fetcherId: string;
    params: Record<string, unknown>;
  };

  // Triggered when an API request successfully returns data
  'api:response': {
    fetcherId: string;
    data: unknown;
  };
};