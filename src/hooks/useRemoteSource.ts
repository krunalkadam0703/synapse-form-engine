import { useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Broker } from '../core/Broker';
import { IRemoteSource } from '../types';

export const useRemoteSource = (fieldId: string, remote?: IRemoteSource) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { getValues } = useFormContext();
  const hasInitialized = useRef(false);

  const fetchData = async (val?: any) => {
    if (!remote) return;
    setLoading(true);
    try {
      const url = new URL(remote.url);
      if (val !== undefined && remote.queryParam) {
        url.searchParams.append(remote.queryParam, String(val));
      }
      const res = await fetch(url.toString(), { method: remote.method });
      const json = await res.json();
      setOptions(remote.dataKey ? json[remote.dataKey] : json);
      hasInitialized.current = true;
    } catch (e) {
      console.error(`API Error on ${fieldId}:`, e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!remote) return;

    // Handle initial load
    if (!hasInitialized.current) {
      if (!remote.queryParam) {
        fetchData(); // Static fetch
      } else {
        const currentVal = getValues(remote.queryParam);
        if (currentVal) fetchData(currentVal); // Fetch based on default/existing value
      }
    }

    // Listen for reactive changes (user interaction)
    const unsubscribe = Broker.subscribe(`api:fetch:${fieldId}`, (p) => fetchData(p.triggerValue));
    return () => unsubscribe();
  }, [fieldId, remote, getValues]);

  return { options, loading };
};