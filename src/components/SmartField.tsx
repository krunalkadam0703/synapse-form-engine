import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Broker } from '../core/Broker';
import { Registry } from '../core/ComponentRegistry';
import { IFieldConfig } from '../types';
import { normalizeFieldOptions } from '../core/FieldOptions';

const SmartFieldComponent: React.FC<{ field: IFieldConfig }> = ({ field }) => {
  const { register, control, formState: { errors } } = useFormContext();
  const Component = Registry.get(field.type);
  const error = errors[field.id];
  const fieldValue = useWatch({ control, name: field.id });
  const normalizedOptions = normalizeFieldOptions(field.options);

  if (!Component) return null;

  const handleChange = (e: any) => {
    const val = e.target?.value !== undefined ? e.target.value : e;
    const value = field.type === 'number' ? Number(val) : val;
    // Notify the engine that a value has changed
    Broker.emit('field:change', { fieldId: field.id, value });
  };

  return (
    <div className="synapse-field-wrapper">
      <Component
        {...field}
        options={normalizedOptions}
        {...register(field.id, { onChange: handleChange })}
        value={fieldValue ?? ''}
        onEngineChange={handleChange}
        error={error?.message}
      />
    </div>
  );
};

const areEqual = (
  prev: Readonly<{ field: IFieldConfig }>,
  next: Readonly<{ field: IFieldConfig }>
) => {
  // Fast path: same object reference
  if (prev.field === next.field) return true;

  // Stable identity keys used by rendering/behavior
  return (
    prev.field.id === next.field.id &&
    prev.field.type === next.field.type &&
    prev.field.label === next.field.label &&
    prev.field.readOnly === next.field.readOnly &&
    prev.field.defaultValue === next.field.defaultValue &&
    prev.field.options === next.field.options &&
    prev.field.validation === next.field.validation &&
    prev.field.calculation === next.field.calculation &&
    prev.field.remoteSource === next.field.remoteSource &&
    prev.field.crossField === next.field.crossField
  );
};

export const SmartField = React.memo(SmartFieldComponent, areEqual);