/**
 * System Status & Health Data Models
 */

export interface SystemHealthComponent {
  name: string;
  status: 'CONNECTED' | 'OPERATIONAL' | 'SYNCED' | 'DISCONNECTED' | 'DEGRADED';
  latencyMs?: number;
  details?: string;
}

export interface SystemStatus {
  ertmacStream: SystemHealthComponent;
  nwisEngine: SystemHealthComponent;
  gisService: SystemHealthComponent;
  historicalDatabase: SystemHealthComponent;
  lastSyncedTimestamp: string;
  isBackendConnected: boolean;
}
