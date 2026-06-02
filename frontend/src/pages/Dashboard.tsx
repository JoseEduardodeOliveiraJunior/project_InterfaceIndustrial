import { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { deviceService, type Device, type TelemetryData } from '../services/deviceService';

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const { lastTelemetry, lastStatus, connected } = useSocket();
  const [telemetryMap, setTelemetryMap] = useState<Record<string, TelemetryData>>({});

  useEffect(() => {
    async function loadDevices() {
      const data = await deviceService.findAll();
      setDevices(data);

      const telemetryPromises = data.map(async (device) => {
        const telemetry = await deviceService.getLatestTelemetry(device.id);
        return telemetry ? { deviceId: device.id, telemetry } : null;
      });

      const telemetryResults = await Promise.all(telemetryPromises);
      const initialMap: Record<string, TelemetryData> = {};
      telemetryResults.forEach((item) => {
        if (item) {
          initialMap[item.deviceId] = item.telemetry;
        }
      });
      setTelemetryMap(initialMap);
      setLoading(false);
    }

    loadDevices();
  }, []);

  useEffect(() => {
    if (lastTelemetry) {
      setTelemetryMap((prev) => ({
        ...prev,
        [lastTelemetry.deviceId]: {
          id: prev[lastTelemetry.deviceId]?.id ?? lastTelemetry.deviceId,
          deviceId: lastTelemetry.deviceId,
          machineName: lastTelemetry.machineName ?? prev[lastTelemetry.deviceId]?.machineName ?? undefined,
          sector: lastTelemetry.sector ?? prev[lastTelemetry.deviceId]?.sector ?? undefined,
          consumptionKwh: lastTelemetry.consumptionKwh ?? prev[lastTelemetry.deviceId]?.consumptionKwh ?? null,
          voltage: lastTelemetry.voltage ?? prev[lastTelemetry.deviceId]?.voltage ?? null,
          current: lastTelemetry.current ?? prev[lastTelemetry.deviceId]?.current ?? null,
          status: lastTelemetry.status ?? prev[lastTelemetry.deviceId]?.status,
          temperature: prev[lastTelemetry.deviceId]?.temperature ?? null,
          speed: prev[lastTelemetry.deviceId]?.speed ?? null,
          pressure: prev[lastTelemetry.deviceId]?.pressure ?? null,
          espStatus: prev[lastTelemetry.deviceId]?.espStatus ?? false,
          lockStatus: prev[lastTelemetry.deviceId]?.lockStatus ?? false,
          recordedAt: lastTelemetry.recordedAt ?? prev[lastTelemetry.deviceId]?.recordedAt ?? new Date().toISOString(),
        },
      }));
    }
  }, [lastTelemetry]);

  useEffect(() => {
    if (lastStatus) {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === lastStatus.deviceId
            ? { ...d, status: lastStatus.status as Device['status'] }
            : d,
        ),
      );
    }
  }, [lastStatus]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === 'online').length;

  const telemetryList = Object.values(telemetryMap).filter((t) => t.consumptionKwh !== null && t.consumptionKwh !== undefined);
  const totalConsumption = telemetryList.reduce((sum, item) => sum + (item.consumptionKwh ?? 0), 0);
  const criticalAlerts = telemetryList.filter((item) => item.status === 'CRITICO').length;

  const sectorTotals = telemetryList.reduce<Record<string, number>>((acc, item) => {
    if (item.sector) {
      acc[item.sector] = (acc[item.sector] ?? 0) + (item.consumptionKwh ?? 0);
    }
    return acc;
  }, {});

  const topSector = Object.entries(sectorTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([sector]) => sector)[0];

  const tableData = devices.map((device) => {
    const telemetry = telemetryMap[device.id];
    return {
      id: device.id,
      machineName: telemetry?.machineName ?? device.name,
      sector: telemetry?.sector ?? 'N/A',
      consumptionKwh: telemetry?.consumptionKwh,
      status: telemetry?.status ?? 'NORMAL',
      voltage: telemetry?.voltage,
      current: telemetry?.current,
      deviceStatus: device.status,
    };
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Painel de Energia Industrial</h1>
          <p className="page-header-sub">
            Monitoramento em tempo real do consumo energético das máquinas
          </p>
        </div>
        <div>
          <span
            className={`badge ${connected ? 'badge-online' : 'badge-offline'}`}
          >
            <span className="badge-dot" />
            {connected ? 'WebSocket ativo' : 'WebSocket desconectado'}
          </span>
        </div>
      </div>

      <div className="grid-dashboard">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Consumo total atual</span>
            <div className="card-icon energy">⚡</div>
          </div>
          <div className="card-value">
            {totalConsumption.toFixed(1)}
            <span className="card-unit">kWh</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Máquinas monitoradas</span>
            <div className="card-icon status">📊</div>
          </div>
          <div className="card-value">{totalDevices}</div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Máquinas ativas</span>
            <div className="card-icon active">🟢</div>
          </div>
          <div className="card-value">{onlineDevices}</div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Alertas críticos</span>
            <div className="card-icon warning">🚨</div>
          </div>
          <div className="card-value" style={{ color: 'var(--status-critical)' }}>
            {criticalAlerts}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Setor com maior consumo</span>
            <div className="card-icon sector">🏭</div>
          </div>
          <div className="card-value">{topSector ?? '—'}</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h2>Histórico de Consumo por Máquina</h2>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Máquina</th>
                <th>Setor</th>
                <th>Consumo</th>
                <th>Status</th>
                <th>Tensão</th>
                <th>Corrente</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item) => (
                <tr key={item.id}>
                  <td>{item.machineName}</td>
                  <td>{item.sector}</td>
                  <td>{item.consumptionKwh?.toFixed(1) ?? '--'} kWh</td>
                  <td>
                    <span className={`badge badge-${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.voltage ? `${item.voltage.toFixed(0)} V` : '--'}</td>
                  <td>{item.current ? `${item.current.toFixed(1)} A` : '--'}</td>
                  <td>
                    <span className={`badge ${item.deviceStatus === 'online' ? 'badge-online' : 'badge-offline'}`}>
                      {item.deviceStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
