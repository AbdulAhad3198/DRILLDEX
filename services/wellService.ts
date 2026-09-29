import { apiClient } from '@/lib/api/client';
import { env } from '@/config/env';
import { 
  INITIAL_ACTIVE_WELL, 
  OFFSET_WELLS 
} from '@/lib/data';
import { 
  ActiveWellState, 
  OffsetWell, 
  QueryFilterParams 
} from '@/types';

export const wellService = {
  /**
   * Fetch current active well state
   */
  async getActiveWell(): Promise<ActiveWellState> {
    if (env.useMockData || !env.apiBaseUrl) {
      return INITIAL_ACTIVE_WELL;
    }

    try {
      const res = await apiClient.get<ActiveWellState>('/api/v1/wells/active');
      return res.data;
    } catch {
      return INITIAL_ACTIVE_WELL;
    }
  },

  /**
   * Fetch list of nearby/offset wells with optional filtering
   */
  async getNearbyWells(params?: QueryFilterParams): Promise<OffsetWell[]> {
    if (env.useMockData || !env.apiBaseUrl) {
      let filtered = [...OFFSET_WELLS];

      if (params?.formation) {
        filtered = filtered.filter(w => w.formation.toLowerCase().includes(params.formation!.toLowerCase()));
      }
      if (params?.radiusKm) {
        filtered = filtered.filter(w => w.distanceKm <= params.radiusKm!);
      }
      if (params?.riskLevel) {
        filtered = filtered.filter(w => w.riskCategory.toLowerCase() === params.riskLevel!.toLowerCase());
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(w => 
          w.name.toLowerCase().includes(q) || 
          w.code.toLowerCase().includes(q) ||
          w.formation.toLowerCase().includes(q)
        );
      }

      return filtered;
    }

    try {
      const res = await apiClient.get<OffsetWell[]>('/api/v1/wells/nearby', {
        radiusKm: params?.radiusKm,
        formation: params?.formation,
        riskLevel: params?.riskLevel,
        search: params?.search,
      });
      return res.data;
    } catch {
      return OFFSET_WELLS;
    }
  },

  /**
   * Get single well details by ID or code
   */
  async getWellById(wellId: string): Promise<OffsetWell | null> {
    if (env.useMockData || !env.apiBaseUrl) {
      const found = OFFSET_WELLS.find(w => w.id === wellId || w.code === wellId);
      return found || OFFSET_WELLS[0] || null;
    }

    try {
      const res = await apiClient.get<OffsetWell>(`/api/v1/wells/${wellId}`);
      return res.data;
    } catch {
      return OFFSET_WELLS.find(w => w.id === wellId) || OFFSET_WELLS[0] || null;
    }
  },
};
