'use client';

import { useState, useEffect, useCallback } from 'react';
import { riskService } from '@/services/riskService';
import { RiskAlert, RiskAnalysis } from '@/types';
import { PRIMARY_RISK_ALERT } from '@/lib/data';

export function useRiskAnalysis(wellId?: string) {
  const [primaryAlert, setPrimaryAlert] = useState<RiskAlert>(PRIMARY_RISK_ALERT as unknown as RiskAlert);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRiskData = useCallback(async () => {
    try {
      const [alert, analysis] = await Promise.all([
        riskService.getPrimaryRiskAlert(wellId),
        riskService.getRiskAnalysis(wellId),
      ]);
      if (alert) setPrimaryAlert(alert);
      if (analysis) setRiskAnalysis(analysis);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to fetch risk analysis');
    }
  }, [wellId]);

  useEffect(() => {
    let active = true;
    Promise.all([
      riskService.getPrimaryRiskAlert(wellId),
      riskService.getRiskAnalysis(wellId),
    ]).then(([alert, analysis]) => {
      if (active) {
        if (alert) setPrimaryAlert(alert);
        if (analysis) setRiskAnalysis(analysis);
      }
    }).catch((err) => {
      if (active) setError(err?.message || 'Failed to fetch risk analysis');
    });
    return () => {
      active = false;
    };
  }, [wellId]);

  return { primaryAlert, riskAnalysis, loading, error, refetch: fetchRiskData };
}
