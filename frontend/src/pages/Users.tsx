import { useEffect, useState, type FormEvent } from 'react';
import { userService, type User, type CreateUserPayload } from '../services/userService';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const loadUsers = async () => {
    setLoading(true);
    const data = await userService.findAll();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
    setEditingUser(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const payload: Record<string, string> = { name, email, role };
      if (password) payload.password = password;
      await userService.update(editingUser.id, payload);
    } else {
      const payload: CreateUserPayload = { name, email, password, role };
      await userService.create(payload);
    }
    setShowModal(false);
    resetForm();
    loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    await userService.remove(id);
    loadUsers();
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
          <h1>Equipe</h1>
          <p className="page-header-sub">{users.length} membros cadastrados</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Novo membro
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 500 }}>{user.name}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.role}`}>{user.role}</span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-icon" onClick={() => openEdit(user)} title="Editar">
                      ✏️
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(user.id)}
                      title="Excluir"
                      style={{ borderColor: 'rgba(239,68,68,0.3)' }}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
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
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Senha {editingUser && '(deixe vazio para manter)'}
                </label>
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  {...(!editingUser && { required: true })}
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Perfil</label>
                <select
                  className="form-input form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
