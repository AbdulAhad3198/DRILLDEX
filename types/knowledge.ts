/**
 * AI Knowledge Base & RAG Query Data Models
 */

export interface SourceDocument {
  id: string;
  name: string;
  title: string;
  type: 'WCR' | 'DDR' | 'Mud Log' | 'Incident Report';
  wellName: string;
  wellCode: string;
  date: string;
  author: string;
  fileSize: string;
  ocrExtractedText: string;
  keyHighlights: string[];
  parametersLogged: {
    depth: string;
    mudWeight: string;
    lossRate: string;
    torqueSpike: string;
    mitigationApplied: string;
  };
}

export interface KnowledgeSearchQuery {
  query: string;
  wellId?: string;
  depth?: number;
  formation?: string;
  filters?: {
    documentType?: string;
    maxDistanceKm?: number;
  };
}

export interface CitationReference {
  documentId: string;
  documentTitle: string;
  wellName: string;
  pageNumber: number;
  snippet: string;
}

export interface KnowledgeSearchResult {
  query: string;
  summary: string;
  keyInsights: string[];
  sources: SourceDocument[];
  citations: CitationReference[];
  confidenceScore: number;
}
