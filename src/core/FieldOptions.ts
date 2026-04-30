import type { IFieldOption, IFieldOptions } from '../types';

type LegacyFieldOptions = {
  source?: unknown;
  data?: unknown;
};

export const normalizeFieldOptions = (
  options?: IFieldOptions | IFieldOption[] | LegacyFieldOptions
): IFieldOption[] => {
  if (!options) return [];

  if (Array.isArray(options)) return options;

  if (Array.isArray((options as LegacyFieldOptions).data)) {
    return (options as LegacyFieldOptions).data as IFieldOption[];
  }

  // Backward compatibility for older apps that used { source: [] }.
  if (Array.isArray((options as LegacyFieldOptions).source)) {
    return (options as LegacyFieldOptions).source as IFieldOption[];
  }

  return [];
};
