'use client';

import { useState, useEffect, useCallback } from 'react';
import { wellService } from '@/services/wellService';
import { OffsetWell, QueryFilterParams } from '@/types';
import { OFFSET_WELLS } from '@/lib/data';

export function useNearbyWells(initialParams?: QueryFilterParams) {
  const [wells, setWells] = useState<OffsetWell[]>(OFFSET_WELLS);
  const [loading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWells = useCallback(async (params?: QueryFilterParams) => {
    try {
      const data = await wellService.getNearbyWells(params || initialParams);
      if (data) setWells(data);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to fetch nearby wells');
    }
  }, [initialParams]);

  useEffect(() => {
    let active = true;
    wellService.getNearbyWells(initialParams).then((data) => {
      if (active && data) setWells(data);
    }).catch((err) => {
      if (active) setError(err?.message || 'Failed to fetch nearby wells');
    });
    return () => {
      active = false;
    };
  }, [initialParams]);

  return { wells, loading, error, refetch: fetchWells };
}
