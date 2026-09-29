/**
 * Environment configuration for eRTMAC-NWIS application.
 * Fallbacks safely to mock data mode if environment variables or API URLs are omitted.
 */

export const env = {
  /**
   * Base URL for the eRTMAC-NWIS REST API (e.g., https://api.ertmac-nwis.oilindia.in or http://localhost:8000).
   * Leave blank or set USE_MOCK_DATA=true to use internal mock repository.
   */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',

  /**
   * WebSocket URL for live drilling telemetry and real-time alerts.
   * e.g. wss://api.ertmac-nwis.oilindia.in/ws/drilling
   */
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || '',

  /**
   * When true (default), application uses internal data adapters and mock fallback data.
   */
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false',

  /**
   * Enables WebSocket connection for live telemetry when true.
   */
  enableRealtime: process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',

  /**
   * Application runtime environment name
   */
  appEnv: process.env.NEXT_PUBLIC_APP_ENV || 'development',

  /**
   * Default API timeout in milliseconds (default: 8000ms)
   */
  apiTimeoutMs: 8000,
};
