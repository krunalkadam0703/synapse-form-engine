import { useState, useEffect, useRef, useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Broker } from '../core/Broker';
import { IRemoteSource } from '../types';

export const useRemoteSource = (fieldId: string, remote?: IRemoteSource) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { setValue, control, getValues } = useFormContext();
  const hasInitialized = useRef(false);

  // 🔹 1. SURGICAL WATCHING
  // We extract the IDs from queryParams and watch ONLY those values.
  const dependencyIds = Object.values(remote?.queryParams ?? {});
  const watchedValues = useWatch({
    control,
    name: dependencyIds,
  });

  const fetchData = useCallback(async () => {
    if (!remote) return;
    setLoading(true);

    try {
      const url = new URL(remote.url);
      let canFetch = true;

      // Append Query Params
      Object.entries(remote.queryParams ?? {}).forEach(([apiParam, sourceFieldId]) => {
        const val = getValues(sourceFieldId);
        if (val !== undefined && val !== null && val !== "") {
          url.searchParams.append(apiParam, String(val));
        } else {
          // If a required dependency is missing, we might want to abort
          canFetch = false; 
        }
      });

      if (!canFetch && dependencyIds.length > 0) {
        setLoading(false);
        return;
      }

      const res = await fetch(url.toString(), { method: remote.method });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} while fetching ${url.toString()}`);
      }
      const json = await res.json();
      const rawData = remote.dataKey ? json[remote.dataKey] : json;

      // 🔹 2. HANDLE JSON-SERVER ARRAY WRAPPER
      // Ensure we treat single objects as arrays for normalization
      const dataArray = Array.isArray(rawData) ? rawData : [rawData];

      if (dataArray.length > 0) {
        // --- AUTO-FILL LOGIC ---
        if (remote.onSuccess) {
          const firstItem = dataArray[0];
          Object.entries(remote.onSuccess).forEach(([apiKey, targetFieldId]) => {
            const newValue = firstItem[apiKey];
            if (newValue !== undefined) {
              setValue(targetFieldId, newValue, { 
                shouldValidate: true, 
                shouldDirty: true 
              });
              // Keep orchestration consistent: calculations/effects listen on field:change.
              Broker.emit('field:change', {
                fieldId: targetFieldId,
                value: newValue
              });
            }
          });
        }

        // --- UI NORMALIZATION ---
        const normalized = dataArray.map((item: any) => ({
          label: String(item[remote.labelKey || 'label'] || item.full_name || item.name || 'Unknown'),
          value: item[remote.valueKey || 'value'] || item.id,
          original: item
        }));
        setOptions(normalized);
      }
      
      hasInitialized.current = true;
    } catch (e) {
      console.error(`[Synapse] API Error for ${fieldId}:`, e);
    } finally {
      setLoading(false);
    }
  }, [remote, fieldId, getValues, setValue]);

  // 🔹 3. STABLE BROKER SUBSCRIPTION
  useEffect(() => {
    if (!remote) return;

    // Listen for manual Broker triggers (e.g., a "Refresh" button)
    const unsubscribe = Broker.subscribe(`api:fetch:${fieldId}`, () => fetchData());

    return () => {
      unsubscribe();
    };
  }, [fetchData, fieldId, remote]);

  // 🔹 4. REACTIVE FETCH TRIGGER
  useEffect(() => {
    if (!remote) return;

    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300); // 300ms Debounce to prevent spamming while typing

    return () => {
      clearTimeout(timeoutId);
    };
  }, [watchedValues, fetchData, remote]);

  return { options, loading };
};