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
  url: string;
  method: 'GET' | 'POST';
  /** * The ID of the field whose value should be sent as a parameter.
   * Example: 'departmentId'
   */
  queryParam?: string; 
  /** * The key in the JSON response containing the data.
   * Example: 'results' or 'data'
   */
  dataKey?: string;    
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

export interface ICrossField {
  targetId: string;   // The field being observed or compared to
  operator?: '>' | '<' | '>=' | '<=' | '==' | '!='; // For Validation
  formula?: string;   // For Calculation (if you want it defined here)
  message?: string;   // Error message for validation failures
}

export interface IFieldValidation {
  rule: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'regex' | 'email' | 'url' | 'uuid';
  value?: any;
  message?: string;
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
  crossField?: ICrossField[];
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
export interface IApiFetchPayload {
  triggerValue: any;
}

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

  /**
   * 🔹 Dynamic API Fetch
   * We use a string index here because api:fetch:${id} is generated at runtime.
   */
  [key: `api:fetch:${string}`]: IApiFetchPayload;

  // Static API triggers (if used)
  'api:fetch': {
    fetcherId: string;
    params: Record<string, unknown>;
  };

  'api:response': {
    fetcherId: string;
    data: unknown;
  };
};

/**
 * BrokerPayload Union
 * Essential for the generic Broker implementation.
 */
export type BrokerPayload = 
  | BrokerEvents['field:change']
  | BrokerEvents['field:reset']
  | BrokerEvents['calc:trigger']
  | BrokerEvents['api:fetch']
  | BrokerEvents['api:response']
  | IApiFetchPayload; 

export type DependencyType = 'calculation' | 'api';

export type DependencyNode = {
  targetFieldId: string;
  type: DependencyType;
};

export type DependencyMap = Record<string, DependencyNode[]>;