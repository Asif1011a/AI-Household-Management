import { useState, useEffect } from 'react';
import { Leaf, Plus, LogIn, Trash2 } from 'lucide-react';
import { getUsers, createUser, loginUser } from '../../services/storage';

export default function LoginPage({ onLogin }) {
  const [users, setUsers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleSelectUser = (userId) => {
    loginUser(userId);
    onLogin();
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const user = createUser(newName.trim());
    loginUser(user.id);
    onLogin();
  };

  return (
    <div className="fade-in" style={{
      minHeight: '100vh',
      width: '100%',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 40,
          background: 'var(--bg-deep)', border: '1px solid var(--green-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-green)', margin: '0 auto 24px'
        }}>
          <Leaf size={40} color="var(--green-400)" />
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: 'var(--text-100)', marginBottom: 8 }}>
          Green<span style={{ color: 'var(--green-400)' }}>Bite</span>
        </h1>
        <p style={{ color: 'var(--text-400)' }}>Select your profile to continue</p>
      </div>

      <div style={{ width: '100%', maxWidth: 400 }}>
        {users.length > 0 && !isCreating ? (
          <div className="stagger">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {users.map(u => (
                <div key={u.id} className="glass-card glass-card-hover" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }} onClick={() => handleSelectUser(u.id)}>
                  <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--glass-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--green-400)' }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-100)' }}>{u.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-500)' }}>GreenBite User</div>
                  </div>
                  <LogIn size={20} color="var(--text-400)" />
                </div>
              ))}
            </div>
            <button className="btn btn-glass btn-full" onClick={() => setIsCreating(true)}>
              <Plus size={18} /> Create New Profile
            </button>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>
              Create Profile
            </h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Your Name</label>
                <input
                  autoFocus
                  className="form-input"
                  placeholder="e.g. Rahul"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full mb-12">
                Get Started
              </button>
              {users.length > 0 && (
                <button type="button" className="btn btn-glass btn-full" onClick={() => setIsCreating(false)}>
                  Back to Profiles
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
