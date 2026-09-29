/**
 * Well & Offset Well Data Models
 */

import { RealTimeParameters } from './drilling';

export type RiskCategoryLevel = 'Significant' | 'Moderate' | 'Low';

export interface OffsetWellIncident {
  id: string;
  type: 'Mud Loss' | 'High Torque' | 'Stuck Pipe' | 'Kick' | 'Normal Drilling';
  depth: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Nominal';
  formation: string;
  description: string;
  mitigation: string;
  outcome: 'Worked' | 'Partially Worked' | 'Failed / NPT';
  nptHours: number;
  sourceDocId: string;
  sourceDocName: string;
  sourceDocPage: number;
}

export interface SimilarityBreakdown {
  geographic: number;
  formation: number;
  depth: number;
  parameter: number;
}

export interface OffsetWell {
  id: string;
  name: string;
  code: string;
  distanceKm: number;
  bearing: string;
  lat: number;
  lng: number;
  formation: string;
  lithology: string;
  wellType: 'Development' | 'Exploration' | 'Appraisal' | 'Abandoned';
  spudDate: string;
  completedDate: string;
  drillingDuration: string;
  totalDepth: number;
  criticalDepth: number;
  status: 'Producing' | 'Shut-in' | 'Plugged & Abandoned' | 'Suspended';
  riskCategory: RiskCategoryLevel;
  similarityScore: number;
  similarityBreakdown: SimilarityBreakdown;
  historicalEventsList: string[];
  relevantDocuments: { id: string; name: string; type: string }[];
  incidents: OffsetWellIncident[];
  summaryNote: string;
  riskHistory: string;
}

export interface ActiveWellState {
  id: string;
  name: string;
  code: string;
  field: string;
  block: string;
  basin: string;
  location: string;
  lat: number;
  lng: number;
  spudDate: string;
  status: string;
  connection: string;
  dataSource: string;
  operator: string;
  currentFormation: string;
  lithology: string;
  parameters: RealTimeParameters;
}

export interface WellTrajectoryPoint {
  measuredDepth: number;
  trueVerticalDepth: number;
  inclination: number;
  azimuth: number;
  dogLegSeverity: number;
}
