/**
 * Risk Analysis, Alert, Evidence and Recommendation Models
 */

export interface RiskEvidenceCard {
  wellId: string;
  wellName: string;
  distanceKm: number;
  formation: string;
  event: string;
  depth: number;
  sourceDoc: string;
  relevancePct: number;
  mitigationApplied: string;
}

export interface RiskEvidenceItem {
  wellId: string;
  wellName: string;
  distanceKm: number;
  depth: number;
  formation: string;
  incidentType: string;
  relevancePct: number;
  sourceDoc: string;
}

export interface KeyActionItem {
  id: string;
  label: string;
  completed: boolean;
  priority: 'Immediate' | 'Pre-Interval' | 'Standby';
}

export interface MitigationHistoryItem {
  wellId: string;
  wellName: string;
  actionTaken: string;
  result: 'Worked' | 'Partially Worked' | 'Failed';
  sourceDoc: string;
  notes: string;
}

export interface EngineerRecommendation {
  title: string;
  body: string;
  disclaimer: string;
}

export interface RiskAlert {
  id: string;
  header: string;
  title: string;
  risk: string;
  riskType: string;
  riskLevel: 'HIGH' | 'CRITICAL' | 'MEDIUM' | 'LOW';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  currentDepth: number;
  riskIntervalStart: number;
  riskIntervalEnd: number;
  expectedIntervalStart: number;
  expectedIntervalEnd: number;
  distanceToInterval: number;
  formation: string;
  lithology: string;
  evidenceSummary: string;
  whyExplanation: string;
  evidenceCards: RiskEvidenceCard[];
  evidenceItems: RiskEvidenceItem[];
  keyObservations: string[];
  recommendation: EngineerRecommendation;
  keyActions: KeyActionItem[];
  mitigationHistory: MitigationHistoryItem[];
}

export interface RiskCategoryScore {
  category: string;
  scorePct: number;
  level: 'Low' | 'Moderate' | 'High' | 'Critical';
  contributingWellsCount: number;
}

export interface RiskAnalysis {
  wellId: string;
  currentDepth: number;
  overallScore: number;
  overallLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  categories: RiskCategoryScore[];
  primaryAlert: RiskAlert;
  updatedAt: string;
}
