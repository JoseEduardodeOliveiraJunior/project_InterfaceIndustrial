import { useEffect, useState, type FormEvent } from 'react';
import { deviceService, type Device, type CreateDevicePayload } from '../services/deviceService';
import { userService, type User } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const { isAdmin } = useAuth();

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('ESP32');
  const [ownerId, setOwnerId] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [devicesData, usersData] = await Promise.all([
      deviceService.findAll(),
      isAdmin ? userService.findAll() : Promise.resolve([]),
    ]);
    setDevices(devicesData);
    setUsers(usersData);
    if (usersData.length > 0 && !ownerId) {
      setOwnerId(usersData[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setName('');
    setType('ESP32');
    setOwnerId(users[0]?.id ?? '');
    setEditingDevice(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (device: Device) => {
    setEditingDevice(device);
    setName(device.name);
    setType(device.type);
    setOwnerId(device.ownerId);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingDevice) {
      await deviceService.update(editingDevice.id, { name, type, ownerId });
    } else {
      const payload: CreateDevicePayload = { name, type, ownerId };
      await deviceService.create(payload);
    }
    setShowModal(false);
    resetForm();
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este dispositivo?')) return;
    await deviceService.remove(id);
    loadData();
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Máquinas</h1>
          <p className="page-header-sub">{devices.length} máquinas cadastradas</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Novo equipamento
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Trava</th>
              <th>Velocidade</th>
              <th>Proprietário</th>
              <th>Device Key</th>
              {isAdmin && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id}>
                <td style={{ fontWeight: 500 }}>{device.name}</td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    {device.type}
                  </span>
                </td>
                <td>
                  <span className={`badge ${device.status === 'online' ? 'badge-online' : 'badge-offline'}`}>
                    <span className="badge-dot" />
                    {device.status}
                  </span>
                </td>
                <td>
                  <span className={`badge ${device.lockStatus ? 'badge-locked' : 'badge-unlocked'}`}>
                    {device.lockStatus ? '🔒 Travado' : '🔓 Livre'}
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {device.speedValue}%
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem' }}>{device.owner?.name ?? '-'}</td>
                <td>
                  <code style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    background: 'var(--bg-primary)',
                    borderRadius: '4px',
                    color: 'var(--text-muted)',
                  }}>
                    {device.deviceKey.slice(0, 12)}...
                  </code>
                </td>
                {isAdmin && (
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-icon" onClick={() => openEdit(device)} title="Editar">
                        ✏️
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(device.id)}
                        title="Excluir"
                        style={{ borderColor: 'rgba(239,68,68,0.3)' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingDevice ? 'Editar Dispositivo' : 'Novo Dispositivo'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: ESP Sala 01"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select
                  className="form-input form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="ESP32">ESP32</option>
                  <option value="ESP8266">ESP8266</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Proprietário</label>
                <select
                  className="form-input form-select"
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDevice ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
