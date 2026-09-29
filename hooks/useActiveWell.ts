'use client';

import { useState, useEffect, useCallback } from 'react';
import { wellService } from '@/services/wellService';
import { ActiveWellState } from '@/types';
import { INITIAL_ACTIVE_WELL } from '@/lib/data';

export function useActiveWell() {
  const [activeWell, setActiveWell] = useState<ActiveWellState>(INITIAL_ACTIVE_WELL);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveWell = useCallback(async () => {
    try {
      const data = await wellService.getActiveWell();
      if (data) setActiveWell(data);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to fetch active well data');
    }
  }, []);

  useEffect(() => {
    let active = true;
    wellService.getActiveWell().then((data) => {
      if (active && data) setActiveWell(data);
    }).catch((err) => {
      if (active) setError(err?.message || 'Failed to fetch active well data');
    });
    return () => {
      active = false;
    };
  }, []);

  const updateDepth = useCallback((newDepth: number) => {
    setActiveWell((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        parameters: {
          ...prev.parameters,
          depth: newDepth,
        },
      };
    });
  }, []);

  return { activeWell, loading, error, refetch: fetchActiveWell, updateDepth };
}
