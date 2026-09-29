import { env } from '@/config/env';
import { ApiResponse, ApiErrorResponse } from '@/types/api';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
}

class ApiClient {
  private getBaseUrl(): string {
    return env.apiBaseUrl.replace(/\/$/, '');
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const baseUrl = this.getBaseUrl();
    const url = baseUrl ? `${baseUrl}${cleanEndpoint}` : cleanEndpoint;

    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions & { method?: string; body?: unknown } = {}
  ): Promise<ApiResponse<T>> {
    const { params, timeoutMs = env.apiTimeoutMs, body, headers, ...customConfig } = options;
    const url = this.buildUrl(endpoint, params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      signal: controller.signal,
      ...customConfig,
    };

    if (body !== undefined) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || errorData?.error || `HTTP error ${response.status}: ${response.statusText}`;
        throw {
          success: false,
          error: errorMessage,
          statusCode: response.status,
          timestamp: new Date().toISOString(),
        } as ApiErrorResponse;
      }

      const json = await response.json();

      // Standardize response payload format
      if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        return json as ApiResponse<T>;
      }

      return {
        success: true,
        data: json as T,
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err && typeof err === 'object' && 'success' in err && (err as ApiErrorResponse).success === false) {
        throw err;
      }

      const isAbort = (err as Error)?.name === 'AbortError';
      const errorMessage = isAbort
        ? `Request timed out after ${timeoutMs}ms`
        : (err as Error)?.message || 'Failed to communicate with API server';

      throw {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      } as ApiErrorResponse;
    }
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET', params });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
