import { apiClient } from '@/lib/api/client';
import { env } from '@/config/env';
import { PRIMARY_RISK_ALERT } from '@/lib/data';
import { RiskAlert } from '@/types';

export const alertService = {
  /**
   * Get all active and historical risk alerts
   */
  async getAlerts(wellId?: string): Promise<RiskAlert[]> {
    const defaultAlerts = [PRIMARY_RISK_ALERT as unknown as RiskAlert];

    if (env.useMockData || !env.apiBaseUrl) {
      return defaultAlerts;
    }

    try {
      const res = await apiClient.get<RiskAlert[]>(`/api/v1/wells/${wellId || 'active'}/alerts`);
      return res.data;
    } catch {
      return defaultAlerts;
    }
  },

  /**
   * Acknowledge or update alert status
   */
  async acknowledgeAlert(alertId: string): Promise<boolean> {
    if (env.useMockData || !env.apiBaseUrl) {
      return true;
    }

    try {
      const res = await apiClient.post<{ acknowledged: boolean }>(`/api/v1/alerts/${alertId}/acknowledge`);
      return res.data.acknowledged;
    } catch {
      return true;
    }
  },
};
