import api from './api';

export interface Device {
  id: string;
  name: string;
  deviceKey: string;
  type: string;
  status: 'online' | 'offline';
  lockStatus: boolean;
  speedValue: number;
  ownerId: string;
  owner?: { id: string; name: string; email: string };
  lastSeenAt: string | null;
  createdAt: string;
}

export interface CreateDevicePayload {
  name: string;
  type?: string;
  ownerId: string;
}

export interface UpdateDevicePayload {
  name?: string;
  type?: string;
  ownerId?: string;
}

export interface TelemetryData {
  id: string;
  deviceId: string;
  machineName?: string | null;
  sector?: string | null;
  consumptionKwh?: number | null;
  voltage?: number | null;
  current?: number | null;
  status?: 'NORMAL' | 'ATENCAO' | 'CRITICO';
  temperature: number | null;
  speed: number | null;
  pressure: number | null;
  espStatus: boolean;
  lockStatus: boolean;
  recordedAt: string;
}

export const deviceService = {
  async findAll(): Promise<Device[]> {
    const { data } = await api.get<Device[]>('/devices');
    return data;
  },
  async findOne(id: string): Promise<Device> {
    const { data } = await api.get<Device>(`/devices/${id}`);
    return data;
  },
  async create(payload: CreateDevicePayload): Promise<Device> {
    const { data } = await api.post<Device>('/devices', payload);
    return data;
  },
  async update(id: string, payload: UpdateDevicePayload): Promise<Device> {
    const { data } = await api.patch<Device>(`/devices/${id}`, payload);
    return data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/devices/${id}`);
  },
  async getTelemetry(deviceId: string): Promise<TelemetryData[]> {
    const { data } = await api.get<TelemetryData[]>(`/devices/${deviceId}/telemetry`);
    return data;
  },
  async getLatestTelemetry(deviceId: string): Promise<TelemetryData | null> {
    const { data } = await api.get<TelemetryData | null>(`/devices/${deviceId}/telemetry/latest`);
    return data;
  },
  async sendCommand(deviceId: string, commandType: string, payload?: Record<string, unknown>) {
    const { data } = await api.post(`/devices/${deviceId}/commands`, { commandType, payload });
    return data;
  },
};
