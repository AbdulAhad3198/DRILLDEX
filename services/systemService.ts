import { apiClient } from '@/lib/api/client';
import { env } from '@/config/env';
import { SystemStatus } from '@/types';

export const systemService = {
  /**
   * Get operational system connectivity status
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const isApiConnected = Boolean(env.apiBaseUrl) && !env.useMockData;

    const mockStatus: SystemStatus = {
      ertmacStream: { name: 'eRTMAC Data Stream', status: 'CONNECTED', latencyMs: 18, details: 'Active telemetry stream' },
      nwisEngine: { name: 'NWIS Knowledge Base & Risk Engine', status: 'OPERATIONAL', latencyMs: 34, details: 'Offset AI model ready' },
      gisService: { name: 'GIS Mapping Service', status: 'CONNECTED', latencyMs: 22, details: 'Geospatial database active' },
      historicalDatabase: { name: 'Historical Well Index', status: 'SYNCED', latencyMs: 15, details: '100% records indexed' },
      lastSyncedTimestamp: new Date().toISOString(),
      isBackendConnected: isApiConnected,
    };

    if (env.useMockData || !env.apiBaseUrl) {
      return mockStatus;
    }

    try {
      const res = await apiClient.get<SystemStatus>('/api/v1/system/status');
      return res.data;
    } catch {
      return mockStatus;
    }
  },
};
