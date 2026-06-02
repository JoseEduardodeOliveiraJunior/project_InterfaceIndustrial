import { useEffect, useState } from 'react';
import { deviceService, type Device, type TelemetryData } from '../services/deviceService';
import { useSocket } from '../hooks/useSocket';

export default function DeviceControl() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [speedValue, setSpeedValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { lastTelemetry } = useSocket();

  useEffect(() => {
    deviceService.findAll().then((data) => {
      setDevices(data);
      if (data.length > 0) {
        setSelectedDevice(data[0]);
      }
      setLoading(false);
    });
  }, []);

  // Load telemetry when device changes
  useEffect(() => {
    if (selectedDevice) {
      deviceService.getLatestTelemetry(selectedDevice.id).then((data) => {
        setTelemetry(data);
        setSpeedValue(selectedDevice.speedValue);
      });
    }
  }, [selectedDevice]);

  // Update from WebSocket
  useEffect(() => {
    if (lastTelemetry && selectedDevice && lastTelemetry.deviceId === selectedDevice.id) {
      setTelemetry((prev) => ({
        ...prev,
        id: prev?.id ?? '',
        deviceId: selectedDevice.id,
        recordedAt: lastTelemetry.recordedAt ?? new Date().toISOString(),
        temperature: lastTelemetry.temperature ?? prev?.temperature ?? null,
        speed: lastTelemetry.speed ?? prev?.speed ?? null,
        pressure: lastTelemetry.pressure ?? prev?.pressure ?? null,
        espStatus: lastTelemetry.espStatus ?? prev?.espStatus ?? false,
        lockStatus: lastTelemetry.lockStatus ?? prev?.lockStatus ?? true,
      }));
    }
  }, [lastTelemetry, selectedDevice]);

  const sendCommand = async (commandType: string, payload?: Record<string, unknown>) => {
    if (!selectedDevice) return;
    setSending(true);
    try {
      await deviceService.sendCommand(selectedDevice.id, commandType, payload);
      // Refresh device data
      const updated = await deviceService.findOne(selectedDevice.id);
      setSelectedDevice(updated);
    } catch (err) {
      console.error('Erro ao enviar comando:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎛️</div>
        <div className="empty-state-text">Nenhum dispositivo cadastrado</div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Painel de Comando</h1>
          <p className="page-header-sub">Gerencie uma máquina e ajuste seus parâmetros.</p>
        </div>
        <select
          className="form-input form-select"
          style={{ width: 240 }}
          value={selectedDevice?.id ?? ''}
          onChange={(e) => {
            const d = devices.find((d) => d.id === e.target.value);
            if (d) setSelectedDevice(d);
          }}
        >
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.type})
            </option>
          ))}
        </select>
      </div>

      {/* Sensor readings */}
      <div className="grid-dashboard" style={{ marginBottom: 32 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Temperatura</span>
            <div className="card-icon temp">🌡️</div>
          </div>
          <div className="card-value">
            {telemetry?.temperature?.toFixed(1) ?? '--'}
            <span className="card-unit">°C</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Velocidade</span>
            <div className="card-icon speed">⚡</div>
          </div>
          <div className="card-value">
            {telemetry?.speed?.toFixed(0) ?? '--'}
            <span className="card-unit">%</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Pressão</span>
            <div className="card-icon pressure">🔧</div>
          </div>
          <div className="card-value">
            {telemetry?.pressure?.toFixed(1) ?? '--'}
            <span className="card-unit">bar</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Status ESP</span>
            <div className="card-icon status">📟</div>
          </div>
          <div className="card-value" style={{ fontSize: '1.3rem' }}>
            <span className={`badge ${telemetry?.espStatus ? 'badge-online' : 'badge-offline'}`}>
              <span className="badge-dot" />
              {telemetry?.espStatus ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      {/* Control panel */}
      <div className="control-panel">
        {/* Lock control */}
        <div className="control-section">
          <div className="control-section-title">
            🔐 Status da trava
          </div>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span
              className={`badge ${selectedDevice?.lockStatus ? 'badge-locked' : 'badge-unlocked'}`}
              style={{ fontSize: '1rem', padding: '8px 20px' }}
            >
              {selectedDevice?.lockStatus ? '🔒 Travado' : '🔓 Liberado'}
            </span>
          </div>

          <div className="control-buttons">
            <button
              className={`control-btn lock ${selectedDevice?.lockStatus ? 'active' : ''}`}
              onClick={() => sendCommand('SET_LOCK', { lock: true })}
              disabled={sending}
            >
              🔒 Ativar trava
            </button>
            <button
              className={`control-btn unlock ${!selectedDevice?.lockStatus ? 'active' : ''}`}
              onClick={() => sendCommand('SET_LOCK', { lock: false })}
              disabled={sending}
            >
              🔓 Desativar
            </button>
          </div>
        </div>

        {/* Speed control */}
        <div className="control-section">
          <div className="control-section-title">
            ⚡ Ajuste de Velocidade
          </div>

          <div className="speed-control">
            <div className="speed-display">
              <span className="speed-value">{speedValue}</span>
              <span className="speed-unit">%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={speedValue}
              onChange={(e) => setSpeedValue(parseInt(e.target.value, 10))}
              className="speed-slider"
            />

            <div className="speed-labels">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>

            <button
              className="btn btn-primary speed-apply"
              onClick={() => sendCommand('SET_SPEED', { speed: speedValue })}
              disabled={sending}
            >
              {sending ? 'Enviando...' : 'Aplicar Velocidade'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
