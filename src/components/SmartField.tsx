import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Broker } from '../core/Broker';
import { Registry } from '../core/ComponentRegistry';
import { IFieldConfig } from '../types';

export const SmartField: React.FC<{ field: IFieldConfig }> = ({ field }) => {
  const { register, formState: { errors } } = useFormContext();
  const Component = Registry.get(field.type);
  const error = errors[field.id];

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
        {...register(field.id, { onChange: handleChange })}
        error={error?.message}
      />
    </div>
  );
};