import { apiClient } from '@/lib/api/client';
import { env } from '@/config/env';
import { PRIMARY_RISK_ALERT } from '@/lib/data';
import { RiskAlert, RiskAnalysis } from '@/types';

export const riskService = {
  /**
   * Get primary upcoming risk alert for active well
   */
  async getPrimaryRiskAlert(wellId?: string): Promise<RiskAlert> {
    if (env.useMockData || !env.apiBaseUrl) {
      return PRIMARY_RISK_ALERT as unknown as RiskAlert;
    }

    try {
      const res = await apiClient.get<RiskAlert>(`/api/v1/wells/${wellId || 'active'}/risk/primary`);
      return res.data;
    } catch {
      return PRIMARY_RISK_ALERT as unknown as RiskAlert;
    }
  },

  /**
   * Get overall risk analysis breakdown
   */
  async getRiskAnalysis(wellId?: string): Promise<RiskAnalysis> {
    const primaryAlert = PRIMARY_RISK_ALERT as unknown as RiskAlert;

    const mockAnalysis: RiskAnalysis = {
      wellId: wellId || 'WELL-NWIS-01',
      currentDepth: 4980,
      overallScore: 68,
      overallLevel: 'MEDIUM',
      categories: [
        { category: 'Mud Loss', scorePct: 78, level: 'High', contributingWellsCount: 3 },
        { category: 'Stuck Pipe', scorePct: 61, level: 'Moderate', contributingWellsCount: 2 },
        { category: 'High Torque', scorePct: 82, level: 'High', contributingWellsCount: 3 },
        { category: 'Kick / Pressure', scorePct: 48, level: 'Low', contributingWellsCount: 1 },
        { category: 'Cementing', scorePct: 36, level: 'Low', contributingWellsCount: 1 },
      ],
      primaryAlert,
      updatedAt: new Date().toISOString(),
    };

    if (env.useMockData || !env.apiBaseUrl) {
      return mockAnalysis;
    }

    try {
      const res = await apiClient.get<RiskAnalysis>(`/api/v1/wells/${wellId || 'active'}/risk`);
      return res.data;
    } catch {
      return mockAnalysis;
    }
  },
};
