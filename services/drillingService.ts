import { apiClient } from '@/lib/api/client';
import { env } from '@/config/env';
import { 
  INITIAL_ACTIVE_WELL, 
  DEPTH_DRILLING_PROFILES, 
  HISTORICAL_TIMELINE_EVENTS 
} from '@/lib/data';
import { 
  RealTimeParameters, 
  DrillingParameterSeriesPoint, 
  TimelineEvent 
} from '@/types';

export const drillingService = {
  /**
   * Get live drilling parameters
   */
  async getLiveParameters(wellId?: string): Promise<RealTimeParameters> {
    if (env.useMockData || !env.apiBaseUrl) {
      return INITIAL_ACTIVE_WELL.parameters;
    }

    try {
      const res = await apiClient.get<RealTimeParameters>(`/api/v1/wells/${wellId || 'active'}/parameters`);
      return res.data;
    } catch {
      return INITIAL_ACTIVE_WELL.parameters;
    }
  },

  /**
   * Get depth parameter chart series data
   */
  async getDepthSeries(wellId?: string): Promise<DrillingParameterSeriesPoint[]> {
    if (env.useMockData || !env.apiBaseUrl) {
      return DEPTH_DRILLING_PROFILES as unknown as DrillingParameterSeriesPoint[];
    }

    try {
      const res = await apiClient.get<DrillingParameterSeriesPoint[]>(`/api/v1/wells/${wellId || 'active'}/depth-series`);
      return res.data;
    } catch {
      return DEPTH_DRILLING_PROFILES as unknown as DrillingParameterSeriesPoint[];
    }
  },

  /**
   * Get historical depth timeline events
   */
  async getTimelineEvents(wellId?: string): Promise<TimelineEvent[]> {
    if (env.useMockData || !env.apiBaseUrl) {
      return HISTORICAL_TIMELINE_EVENTS as TimelineEvent[];
    }

    try {
      const res = await apiClient.get<TimelineEvent[]>(`/api/v1/wells/${wellId || 'active'}/timeline`);
      return res.data;
    } catch {
      return HISTORICAL_TIMELINE_EVENTS as TimelineEvent[];
    }
  },
};
