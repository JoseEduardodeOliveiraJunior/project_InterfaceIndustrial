import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

interface TelemetryUpdate {
  deviceId: string;
  deviceName?: string;
  machineName?: string;
  sector?: string;
  consumptionKwh?: number;
  voltage?: number;
  current?: number;
  status?: 'NORMAL' | 'ATENCAO' | 'CRITICO';
  recordedAt?: string;
}

interface DeviceStatusUpdate {
  deviceId: string;
  status: string;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [lastTelemetry, setLastTelemetry] = useState<TelemetryUpdate | null>(null);
  const [lastStatus, setLastStatus] = useState<DeviceStatusUpdate | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:3000/telemetry', {
      transports: ['websocket'],
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('telemetry:update', (data: TelemetryUpdate) => {
      setLastTelemetry(data);
    });

    socket.on('device:status', (data: DeviceStatusUpdate) => {
      setLastStatus(data);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return { lastTelemetry, lastStatus, connected };
}
