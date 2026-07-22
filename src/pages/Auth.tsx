// src/pages/Auth.tsx
import React, { useState, useEffect } from 'react';
import { Plane, Lock, Mail, User as UserIcon, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: (token: string, user: any) => void;
  onBackToLanding: () => void;
  initialTab?: 'login' | 'register';
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess, onBackToLanding, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setSuccessMsg('Login successful! Redirecting...');
        localStorage.setItem('token', data.token);
        setTimeout(() => {
          onLoginSuccess(data.token, data.user);
        }, 800);
      } else {
        setErrorMsg(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMsg('Network connectivity issue. Ensure PHP server is online.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setSuccessMsg('Registration successful! Access granted.');
        localStorage.setItem('token', data.token);
        setTimeout(() => {
          onLoginSuccess(data.token, data.user);
        }, 800);
      } else {
        setErrorMsg(data.error || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Network error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ position: 'relative' }}>
      <button className="back-to-landing" onClick={onBackToLanding}>
        <ArrowLeft size={16} />
        <span>Back to Event Site</span>
      </button>
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--primary-light)', marginBottom: '1rem', border: '1px solid var(--primary-border)' }}>
            <Plane size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 className="auth-title" style={{ fontSize: '1.5rem' }}>National Aeromodelling Championship 2026</h2>
          <p style={{ fontSize: '0.9rem' }}>National Aeromodelling Registration & Scoring</p>
        </div>

        <div className="tab-nav">
          <button 
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }} 
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            style={{ flex: 1 }}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }} 
            className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
            style={{ flex: 1 }}
          >
            Create Account
          </button>
        </div>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@aeroclub.com" 
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••" 
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
              <div>Demo Credentials:</div>
              <div>Admin: <strong>admin@aeroclub.com</strong> / <strong>admin123</strong></div>
              <div>Judge: <strong>judge@aeroclub.com</strong> / <strong>judge123</strong></div>
              <div>Pilot: <strong>pilot@aeroclub.com</strong> / <strong>pilot123</strong></div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ravi Kumar" 
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <UserIcon size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@aeroclub.com" 
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••" 
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group">
                <label>Confirm</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password" 
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••" 
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Pilot Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
