// src/App.tsx
import { useState, useEffect } from 'react';
import { Auth } from './pages/Auth';
import { Layout } from './components/Layout';
import { UserPortal } from './pages/UserPortal';
import { CommPortal } from './pages/CommPortal';
import { AdminPortal } from './pages/AdminPortal';
import { Leaderboards } from './components/Leaderboards';
import { Leaderboard } from './pages/Leaderboard';
import { Landing } from './pages/Landing';
import { Rules } from './pages/Rules';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'commissioner' | 'user';
  father_name?: string;
  education?: string;
  address?: string;
  experience_plane?: string;
  experience_heli?: string;
  experience_glider?: string;
  experience_jet?: string;
  competition_exp?: string;
  judging_exp?: string;
  models_bringing?: string;
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'portal' | 'leaderboard' | 'rules'>('landing');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Authenticate user on startup
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await fetch('/api/auth.php', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            setToken(storedToken);
            setDefaultTab(data.user.role);
            setView('portal');
          } else {
            // Token expired/invalid
            handleLogout();
          }
        } catch (e) {
          console.error("Auto login check failed", e);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const setDefaultTab = (role: string) => {
    if (role === 'user') setActiveTab('registration-wizard');
    else if (role === 'commissioner') setActiveTab('comm-checklist');
    else if (role === 'admin') setActiveTab('admin-stats');
  };

  const handleLoginSuccess = (newToken: string, loggedUser: User) => {
    setToken(newToken);
    setUser(loggedUser);
    setDefaultTab(loggedUser.role);
    setView('portal');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setActiveTab('');
    setView('landing');
  };

  const handleProfileUpdated = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19', color: '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #6366f1', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>Starting AeroManager...</span>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Not Authenticated - Views
  if (view === 'leaderboard') {
    return <Leaderboard onBack={() => setView('landing')} />;
  }

  if (view === 'rules') {
    return <Rules onBack={() => setView('landing')} />;
  }

  if ((!token || !user) && view === 'landing') {
    return (
      <Landing 
        onNavigateToAuth={(tab) => {
          setAuthTab(tab);
          setView('portal');
        }} 
        onNavigateToLeaderboard={() => setView('leaderboard')}
        onNavigateToRules={() => setView('rules')}
      />
    );
  }

  if (!token || !user) {
    return (
      <Auth 
        onLoginSuccess={handleLoginSuccess} 
        onBackToLanding={() => setView('landing')}
        initialTab={authTab}
      />
    );
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {/* Universal Standings Tab */}
      {activeTab === 'leaderboards' && <Leaderboards />}

      {/* User / Pilot Views */}
      {user.role === 'user' && activeTab !== 'leaderboards' && (
        <UserPortal 
          user={user} 
          onProfileUpdated={handleProfileUpdated} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
        />
      )}

      {/* Commissioner Views */}
      {user.role === 'commissioner' && activeTab !== 'leaderboards' && (
        <CommPortal 
          activeTab={activeTab}
        />
      )}

      {/* Administrator Views */}
      {user.role === 'admin' && activeTab !== 'leaderboards' && (
        <AdminPortal 
          activeTab={activeTab}
        />
      )}
    </Layout>
  );
}

export default App;
