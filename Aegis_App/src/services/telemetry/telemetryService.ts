import { TrackedUnit, Coordinate, TelemetryPacket } from '../../types';

type TelemetryListener = (unit: TrackedUnit) => void;
type FleetSnapshotListener = (units: TrackedUnit[]) => void;

/**
 * Real-Time Telemetry & Movement Synchronization Service
 * 
 * Connects over WebSocket to backend-server (/ws/telemetry)
 * Synchronizes ambulance, rescue boat, and civilian movements live on Google Maps.
 * Includes a resilient fallback simulator for offline / showcase demos.
 */
export class TelemetryService {
  private static socket: WebSocket | null = null;
  private static listeners: Set<TelemetryListener> = new Set();
  private static snapshotListeners: Set<FleetSnapshotListener> = new Set();
  private static isConnected = false;
  private static reconnectTimer: any = null;
  private static pingInterval: any = null;
  private static simulationTimer: any = null;

  private static getWebSocketUrl(): string {
    const httpUrl = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
    const wsUrl = httpUrl.replace(/^http/, 'ws');
    return `${wsUrl}/ws/telemetry`;
  }

  /**
   * Connect to the live telemetry WebSocket stream
   */
  static connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = this.getWebSocketUrl();
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.isConnected = true;
        console.log('[TelemetryService] Connected to live WebSocket telemetry stream');
        
        // Heartbeat keep-alive every 25 seconds
        this.pingInterval = setInterval(() => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'PING' }));
          }
        }, 25000);
      };

      this.socket.onmessage = (event) => {
        try {
          const packet: TelemetryPacket = JSON.parse(event.data);
          
          if (packet.type === 'FLEET_SNAPSHOT' && packet.units) {
            this.snapshotListeners.forEach((fn) => fn(packet.units || []));
          } else if (packet.type === 'LOCATION_UPDATE' && packet.unitId && packet.coordinate) {
            const unit: TrackedUnit = {
              unitId: packet.unitId,
              name: packet.name || packet.unitId,
              role: packet.role || 'AMBULANCE',
              coordinate: packet.coordinate,
              heading: packet.heading || 0,
              speedKmH: packet.speedKmH || 0,
              status: packet.status || 'EN_ROUTE',
              targetCivilianId: packet.targetCivilianId,
              lastUpdated: packet.timestamp || Date.now(),
            };
            this.listeners.forEach((fn) => fn(unit));
          }
        } catch (e) {
          console.warn('[TelemetryService] Failed to parse telemetry packet:', e);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        clearInterval(this.pingInterval);
        console.log('[TelemetryService] Socket disconnected. Scheduling reconnect...');
        this.scheduleReconnect();
      };

      this.socket.onerror = (err) => {
        console.warn('[TelemetryService] Socket connection error:', err);
      };
    } catch (e) {
      console.warn('[TelemetryService] Connection initialization failed:', e);
      this.scheduleReconnect();
    }
  }

  private static scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  /**
   * Subscribe to live position updates for vehicles and civilians
   */
  static subscribe(onUpdate: TelemetryListener, onSnapshot?: FleetSnapshotListener): () => void {
    this.listeners.add(onUpdate);
    if (onSnapshot) this.snapshotListeners.add(onSnapshot);

    // Auto connect if not yet active
    this.connect();

    return () => {
      this.listeners.delete(onUpdate);
      if (onSnapshot) this.snapshotListeners.delete(onSnapshot);
    };
  }

  /**
   * Broadcast current device position to the network
   */
  static broadcastPosition(unit: Partial<TrackedUnit> & { coordinate: Coordinate }): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const packet: TelemetryPacket = {
      type: 'LOCATION_UPDATE',
      unitId: unit.unitId || 'CIV-01',
      name: unit.name || 'Civilian Device',
      role: unit.role || 'CIVILIAN',
      coordinate: unit.coordinate,
      heading: unit.heading || 0,
      speedKmH: unit.speedKmH || 0,
      status: unit.status || 'EVACUATING',
      targetCivilianId: unit.targetCivilianId,
      timestamp: Date.now(),
    };

    try {
      this.socket.send(JSON.stringify(packet));
    } catch (e) {
      console.warn('[TelemetryService] Failed to send telemetry update:', e);
    }
  }

  /**
   * Disconnect cleanly
   */
  static disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.simulationTimer) clearInterval(this.simulationTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  /**
   * High-Fidelity Simulation Mode:
   * Smoothly drives a vehicle along a given polyline corridor, triggering location updates
   * and trace breadcrumbs every 1.5 seconds.
   */
  static startVehicleSimulation(
    polyline: Coordinate[],
    unitInfo: { unitId: string; name: string; role: TrackedUnit['role'] },
    onStep: (unit: TrackedUnit) => void
  ): () => void {
    if (!polyline || polyline.length < 2) return () => {};

    if (this.simulationTimer) clearInterval(this.simulationTimer);

    let currentIndex = 0;
    const tracedPath: Coordinate[] = [polyline[0]];

    this.simulationTimer = setInterval(() => {
      if (currentIndex >= polyline.length - 1) {
        clearInterval(this.simulationTimer);
        return;
      }

      currentIndex++;
      const currentPoint = polyline[currentIndex];
      const prevPoint = polyline[currentIndex - 1];

      // Calculate bearing angle
      const dLon = ((currentPoint.longitude - prevPoint.longitude) * Math.PI) / 180;
      const lat1 = (prevPoint.latitude * Math.PI) / 180;
      const lat2 = (currentPoint.latitude * Math.PI) / 180;
      const y = Math.sin(dLon) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
      const heading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

      tracedPath.push(currentPoint);

      const simulatedUnit: TrackedUnit = {
        unitId: unitInfo.unitId,
        name: unitInfo.name,
        role: unitInfo.role,
        coordinate: currentPoint,
        heading: Math.round(heading),
        speedKmH: 45,
        status: currentIndex === polyline.length - 1 ? 'ON_SCENE' : 'EN_ROUTE',
        tracedPath: [...tracedPath],
        lastUpdated: Date.now(),
      };

      onStep(simulatedUnit);
      // Also broadcast to WebSocket if open
      this.broadcastPosition(simulatedUnit);
    }, 1500);

    return () => {
      if (this.simulationTimer) clearInterval(this.simulationTimer);
    };
  }
}
