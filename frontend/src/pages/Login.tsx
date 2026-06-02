import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch {
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <aside className="login-hero">
        <div className="login-hero-brand">
          <h1>MAQHUB</h1>
          <p>
            Controle Industrial Centralizado
          </p>
        </div>

        <div className="login-hero-features">
          <div className="login-hero-feature">
            ▸ Monitoramento em tempo real
          </div>
          <div className="login-hero-feature">
            ▸ Gerenciamento de máquinas
          </div>
          <div className="login-hero-feature">
            ▸ Comandos remotos avançados
          </div>
          <div className="login-hero-feature">
            ▸ Segurança com autenticação
          </div>
        </div>
      </aside>

      <section className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">▲</div>
          <h2>
            Maq<span>Hub</span>
          </h2>
          <p>Autenticação Segura</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="admin@maqhub.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="····················"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? '[ CONECTANDO ]' : '[ ENTRAR ]'}
          </button>
        </form>
      </section>
    </div>
  );
}
