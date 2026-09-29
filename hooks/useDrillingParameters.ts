'use client';

import { useState, useEffect, useCallback } from 'react';
import { drillingService } from '@/services/drillingService';
import { RealTimeParameters, DrillingParameterSeriesPoint, TimelineEvent } from '@/types';
import { INITIAL_ACTIVE_WELL, DEPTH_DRILLING_PROFILES, HISTORICAL_TIMELINE_EVENTS } from '@/lib/data';

export function useDrillingParameters(wellId?: string) {
  const [parameters, setParameters] = useState<RealTimeParameters>(INITIAL_ACTIVE_WELL.parameters);
  const [seriesData, setSeriesData] = useState<DrillingParameterSeriesPoint[]>(DEPTH_DRILLING_PROFILES as unknown as DrillingParameterSeriesPoint[]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(HISTORICAL_TIMELINE_EVENTS as TimelineEvent[]);
  const [loading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllDrillingData = useCallback(async () => {
    try {
      const [params, series, timeline] = await Promise.all([
        drillingService.getLiveParameters(wellId),
        drillingService.getDepthSeries(wellId),
        drillingService.getTimelineEvents(wellId),
      ]);
      if (params) setParameters(params);
      if (series) setSeriesData(series);
      if (timeline) setTimelineEvents(timeline);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to fetch drilling parameters');
    }
  }, [wellId]);

  useEffect(() => {
    let active = true;
    Promise.all([
      drillingService.getLiveParameters(wellId),
      drillingService.getDepthSeries(wellId),
      drillingService.getTimelineEvents(wellId),
    ]).then(([params, series, timeline]) => {
      if (active) {
        if (params) setParameters(params);
        if (series) setSeriesData(series);
        if (timeline) setTimelineEvents(timeline);
      }
    }).catch((err) => {
      if (active) setError(err?.message || 'Failed to fetch drilling parameters');
    });
    return () => {
      active = false;
    };
  }, [wellId]);

  return { parameters, seriesData, timelineEvents, loading, error, refetch: fetchAllDrillingData };
}
