/**
 * Standardized API Response Contracts for eRTMAC-NWIS REST APIs
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string | null;
  error?: string | null;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string | null;
  error?: string | null;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  statusCode?: number;
  message?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface QueryFilterParams {
  wellId?: string;
  formation?: string;
  riskLevel?: string;
  minDepth?: number;
  maxDepth?: number;
  radiusKm?: number;
  lat?: number;
  lng?: number;
  page?: number;
  pageSize?: number;
  search?: string;
}
