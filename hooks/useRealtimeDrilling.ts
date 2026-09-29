'use client';

import { useEffect, useState } from 'react';
import { realtimeClient } from '@/lib/realtime/client';
import { RealTimeParameters } from '@/types';

export function useRealtimeDrilling(onUpdate?: (params: Partial<RealTimeParameters>) => void) {
  const [isConnected, setIsConnected] = useState<boolean>(realtimeClient.isSocketConnected());

  useEffect(() => {
    const unsubscribeStatus = realtimeClient.subscribe<{ connected: boolean }>(
      'connection:status',
      (status) => setIsConnected(status.connected)
    );

    const unsubscribeDrilling = realtimeClient.subscribe<{ parameters: Partial<RealTimeParameters> }>(
      'drilling:update',
      (data) => {
        if (data && data.parameters && onUpdate) {
          onUpdate(data.parameters);
        }
      }
    );

    return () => {
      unsubscribeStatus();
      unsubscribeDrilling();
    };
  }, [onUpdate]);

  return { isConnected };
}
