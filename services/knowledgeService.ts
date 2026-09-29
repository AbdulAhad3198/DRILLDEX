import { apiClient } from '@/lib/api/client';
import { env } from '@/config/env';
import { HISTORICAL_DOCUMENTS } from '@/lib/data';
import { 
  KnowledgeSearchQuery, 
  KnowledgeSearchResult, 
  SourceDocument 
} from '@/types';

export const knowledgeService = {
  /**
   * Perform AI semantic RAG search across historical well documents
   */
  async searchKnowledge(queryPayload: KnowledgeSearchQuery): Promise<KnowledgeSearchResult> {
    const defaultDocs = HISTORICAL_DOCUMENTS as unknown as SourceDocument[];

    const mockResult: KnowledgeSearchResult = {
      query: queryPayload.query,
      summary: `Historical evidence across nearby offset wells indicates elevated mud loss and torque spikes between 5,020 m and 5,070 m within Formation X.`,
      keyInsights: [
        'Well A (DOC-DDR-WELL-A-042): Severe mud loss of 78 bbl/hr at 5,040 m.',
        'Well B (DOC-WCR-WELL-B-019): High torque spike (up to 38 kNm) at 5,060 m requiring reaming.',
        'Well C (DOC-INC-WELL-C-008): Partial lost circulation of 42 bbl/hr at 5,025 m.',
      ],
      sources: defaultDocs,
      citations: [
        {
          documentId: defaultDocs[0]?.id || 'DOC-1',
          documentTitle: defaultDocs[0]?.title || 'Daily Drilling Report',
          wellName: 'Well A',
          pageNumber: 4,
          snippet: 'Lost 78 bbl mud upon penetrating micro-fractured carbonaceous shale at 5,040 m.',
        },
        {
          documentId: defaultDocs[1]?.id || 'DOC-2',
          documentTitle: defaultDocs[1]?.title || 'Well Completion Report',
          wellName: 'Well B',
          pageNumber: 12,
          snippet: 'Torque increased to 38 kNm at 5,060 m. Backreamed with 1.22 SG mud.',
        },
      ],
      confidenceScore: 0.89,
    };

    if (env.useMockData || !env.apiBaseUrl) {
      return mockResult;
    }

    try {
      const res = await apiClient.post<KnowledgeSearchResult>('/api/v1/knowledge/query', queryPayload);
      return res.data;
    } catch {
      return mockResult;
    }
  },

  /**
   * Fetch historical well source documents
   */
  async getDocuments(wellId?: string): Promise<SourceDocument[]> {
    if (env.useMockData || !env.apiBaseUrl) {
      return HISTORICAL_DOCUMENTS as unknown as SourceDocument[];
    }

    try {
      const res = await apiClient.get<SourceDocument[]>('/api/v1/documents', { wellId });
      return res.data;
    } catch {
      return HISTORICAL_DOCUMENTS as unknown as SourceDocument[];
    }
  },
};
