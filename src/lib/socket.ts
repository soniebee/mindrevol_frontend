// src/lib/socket.ts
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { DOMAIN } from './http';

const SOCKET_URL = `${DOMAIN}/ws`;

class SocketClient {
  private client: Client;
  public connected: boolean = false;
  
  // Queue subscriptions while socket is not ready
  private pendingSubscriptions: Array<{
    topic: string;
    callback: (data: any) => void;
    id: string; // Temporary ID so it can be removed before connect
  }> = [];

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => {
        if (import.meta.env.DEV && !str.includes("PING") && !str.includes("PONG")) {
            console.log('[WS]:', str);
        }
      },
    });

    this.client.onConnect = () => {
      this.connected = true;
      console.log('✅ Connected to WebSocket');
      
      // [IMPORTANT] Replay all queued subscriptions
      this.processPendingSubscriptions();
    };

    this.client.onDisconnect = () => {
      this.connected = false;
      console.log('🔌 Disconnected from WebSocket');
    };

    this.client.onStompError = (frame) => {
      console.error('❌ Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };
  }

  // Process queued subscriptions
  private processPendingSubscriptions() {
    if (!this.pendingSubscriptions.length) return;

    console.log(`🔄 Processing ${this.pendingSubscriptions.length} pending subscriptions...`);
    this.pendingSubscriptions.forEach((sub) => {
      this.client.subscribe(sub.topic, (message) => {
        if (message.body) {
          try {
            sub.callback(JSON.parse(message.body));
          } catch (e) {
            console.error("JSON Parse Error:", e);
          }
        }
      });
    });
    // Clear queue after processing
    this.pendingSubscriptions = []; 
  }

  connect() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.client.connectHeaders = { Authorization: `Bearer ${token}` };
      if (!this.client.active) {
        this.client.activate();
      }
    }
  }

  disconnect() {
    if (this.client.active) {
      this.client.deactivate();
      this.connected = false;
    }
  }

  /**
   * Safe subscribe behavior:
   * - If connected: subscribe immediately.
   * - If not connected: enqueue and return a fallback unsubscribe handle.
   */
  subscribe(topic: string, callback: (data: any) => void) {
    // 1) Activate socket if needed
    if (!this.client.active) {
        this.connect();
    }

    // 2) If already connected, subscribe directly
    if (this.client.connected) {
      return this.client.subscribe(topic, (message) => {
        if (message.body) {
          try {
            const parsed = JSON.parse(message.body);
            callback(parsed);
          } catch (e) {
            console.error("Error parsing message:", e);
          }
        }
      });
    }

    // 3) If not connected yet, push to queue
    console.log(`⏳ Socket not ready, queueing subscription for: ${topic}`);
    const tempId = crypto.randomUUID();
    
    this.pendingSubscriptions.push({ topic, callback, id: tempId });

    // Return fallback unsubscribe so React effects stay safe
    return {
      id: tempId,
      unsubscribe: () => {
        // Remove queued subscription if component unmounts before connect
        this.pendingSubscriptions = this.pendingSubscriptions.filter(s => s.id !== tempId);
      }
    };
  }

  send(destination: string, body: any) {
    if (this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
        console.warn('Socket is not connected, cannot send message:', destination);
    }
  }
}

export const socket = new SocketClient();