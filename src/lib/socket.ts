// src/lib/socket.ts
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { DOMAIN } from './http';

const SOCKET_URL = `${DOMAIN}/ws`;

class SocketClient {
  private client: Client;
  public connected: boolean = false;
  
  // Hàng đợi: Lưu các lệnh subscribe khi socket chưa sẵn sàng
  private pendingSubscriptions: Array<{
    topic: string;
    callback: (data: any) => void;
    id: string; // ID tạm để hủy nếu cần
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
      
      // [QUAN TRỌNG] Chạy lại tất cả các subscription đang chờ
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

  // Xử lý hàng đợi
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
    // Xóa hàng đợi sau khi đã xử lý
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
   * Hàm subscribe an toàn:
   * - Nếu đã connect: Subscribe ngay.
   * - Nếu chưa connect: Lưu vào hàng đợi, trả về unsubscribe giả để React không lỗi.
   */
  subscribe(topic: string, callback: (data: any) => void) {
    // 1. Nếu socket chưa active, kích hoạt nó
    if (!this.client.active) {
        this.connect();
    }

    // 2. Nếu đã kết nối, gọi lệnh của thư viện
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

    // 3. Nếu CHƯA kết nối, đưa vào hàng đợi (Queue)
    console.log(`⏳ Socket not ready, queueing subscription for: ${topic}`);
    const tempId = crypto.randomUUID();
    
    this.pendingSubscriptions.push({ topic, callback, id: tempId });

    // Trả về hàm unsubscribe giả để React useEffect không bị crash
    return {
      id: tempId,
      unsubscribe: () => {
        // Xóa khỏi hàng đợi nếu component unmount trước khi socket connect xong
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
        console.warn("Socket chưa kết nối, không thể gửi tin:", destination);
    }
  }
}

export const socket = new SocketClient();