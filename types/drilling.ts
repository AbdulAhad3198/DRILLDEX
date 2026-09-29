/**
 * Drilling Parameter & Telemetry Data Models
 */

export interface RealTimeParameters {
  depth: number;
  targetDepth: number;
  rop: number;
  ropDeltaPct: number;
  wob: number;
  torque: number;
  torqueDeltaPct: number;
  rpm: number;
  spp: number;
  flowRate: number;
  mudWeight: number;
  ecd: number;
  gasUnits: number;
  pitVolume: number;
  tripMargin: number;
}

export interface DrillingParameterSeriesPoint {
  depth: number;
  rop: number;
  wob: number;
  torque: number;
  spp: number;
  flowRate: number;
  mudWeight: number;
}

export interface TimelineEvent {
  depth: number;
  title: string;
  well?: string;
  description: string;
  category: 'normal' | 'geological' | 'current' | 'incident';
  type: 'Normal drilling' | 'Formation change' | 'Current Depth' | 'Stuck pipe' | 'Mud loss' | 'High torque';
  severity?: 'critical' | 'high' | 'info' | 'nominal';
}

export interface DrillingUpdateEvent {
  event: 'drilling:update';
  wellId: string;
  timestamp: string;
  parameters: Partial<RealTimeParameters>;
}
