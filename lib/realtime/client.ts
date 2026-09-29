import { env } from '@/config/env';

type EventCallback<T = unknown> = (data: T) => void;

class RealtimeClient {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined' && env.enableRealtime && env.wsUrl) {
      this.connect();
    }
  }

  public connect(): void {
    if (this.socket || !env.wsUrl || typeof window === 'undefined') return;

    try {
      this.socket = new WebSocket(env.wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.emitLocal('connection:status', { connected: true });
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message && message.event) {
            this.emitLocal(message.event, message.data || message);
          }
        } catch {
          // Ignore non-JSON messages
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.socket = null;
        this.emitLocal('connection:status', { connected: false });
        this.scheduleReconnect();
      };

      this.socket.onerror = () => {
        this.isConnected = false;
      };
    } catch {
      this.isConnected = false;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || !env.enableRealtime) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  public subscribe<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    return () => {
      this.unsubscribe(event, callback as EventCallback);
    };
  }

  public unsubscribe(event: string, callback: EventCallback): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  public emitLocal(event: string, data: unknown): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (e) {
          console.warn(`Error in realtime listener for ${event}:`, e);
        }
      });
    }
  }

  public send(event: string, data: unknown): void {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({ event, data }));
    }
  }

  public isSocketConnected(): boolean {
    return this.isConnected;
  }

  public disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

export const realtimeClient = new RealtimeClient();
