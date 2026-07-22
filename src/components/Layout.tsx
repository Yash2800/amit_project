// src/components/Layout.tsx
import React from 'react';
import { 
  LogOut, 
  User as UserIcon, 
  Award, 
  Sliders, 
  Users, 
  Trophy, 
  CheckSquare,
  ClipboardCheck,
  Zap
} from 'lucide-react';
import aeroClubLogo from '../assets/aero_club_logo.png';

interface LayoutProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  user, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  children 
}) => {
  const isUser = user.role === 'user';
  const isComm = user.role === 'commissioner';
  const isAdmin = user.role === 'admin';

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'center' }}>
          <img src={aeroClubLogo} alt="Aero Club" style={{ height: '40px', width: 'auto' }} />
        </div>
        
        <nav className="sidebar-nav">
          <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Navigation
          </div>

          {/* User Links */}
          {isUser && (
            <>
              <button 
                onClick={() => setActiveTab('registration-wizard')} 
                className={`sidebar-link ${activeTab === 'registration-wizard' ? 'active' : ''}`}
              >
                <UserIcon size={18} />
                <span>Registration Form</span>
              </button>

              <button 
                onClick={() => setActiveTab('my-registrations')} 
                className={`sidebar-link ${activeTab === 'my-registrations' ? 'active' : ''}`}
              >
                <CheckSquare size={18} />
                <span>My Submissions</span>
              </button>
              <button 
                onClick={() => setActiveTab('leaderboards')} 
                className={`sidebar-link ${activeTab === 'leaderboards' ? 'active' : ''}`}
              >
                <Trophy size={18} />
                <span>Leaderboard</span>
              </button>
            </>
          )}

          {/* Commissioner Links */}
          {isComm && (
            <>
              <button 
                onClick={() => setActiveTab('comm-checklist')} 
                className={`sidebar-link ${activeTab === 'comm-checklist' ? 'active' : ''}`}
              >
                <ClipboardCheck size={18} />
                <span>Tech Inspection</span>
              </button>
              <button 
                onClick={() => setActiveTab('comm-scoring')} 
                className={`sidebar-link ${activeTab === 'comm-scoring' ? 'active' : ''}`}
              >
                <Award size={18} />
                <span>Flight Scoring</span>
              </button>
              <button 
                onClick={() => setActiveTab('leaderboards')} 
                className={`sidebar-link ${activeTab === 'leaderboards' ? 'active' : ''}`}
              >
                <Trophy size={18} />
                <span>Leaderboards</span>
              </button>
            </>
          )}

          {/* Admin Links */}
          {isAdmin && (
            <>
              <button 
                onClick={() => setActiveTab('admin-stats')} 
                className={`sidebar-link ${activeTab === 'admin-stats' ? 'active' : ''}`}
              >
                <Sliders size={18} />
                <span>Analytics Dashboard</span>
              </button>
              <button 
                onClick={() => setActiveTab('admin-registrations')} 
                className={`sidebar-link ${activeTab === 'admin-registrations' ? 'active' : ''}`}
              >
                <ClipboardCheck size={18} />
                <span>Registrations</span>
              </button>
              <button 
                onClick={() => setActiveTab('admin-users')} 
                className={`sidebar-link ${activeTab === 'admin-users' ? 'active' : ''}`}
              >
                <Users size={18} />
                <span>User Directory</span>
              </button>
              <button 
                onClick={() => setActiveTab('admin-categories')} 
                className={`sidebar-link ${activeTab === 'admin-categories' ? 'active' : ''}`}
              >
                <Sliders size={18} />
                <span>Manage Categories</span>
              </button>
              <button 
                onClick={() => setActiveTab('admin-updates')} 
                className={`sidebar-link ${activeTab === 'admin-updates' ? 'active' : ''}`}
              >
                <Zap size={18} />
                <span>Flash Updates</span>
              </button>
              <button 
                onClick={() => setActiveTab('admin-scoring')} 
                className={`sidebar-link ${activeTab === 'admin-scoring' ? 'active' : ''}`}
              >
                <Award size={18} />
                <span>Flight Scoring</span>
              </button>
              <button 
                onClick={() => setActiveTab('leaderboards')} 
                className={`sidebar-link ${activeTab === 'leaderboards' ? 'active' : ''}`}
              >
                <Trophy size={18} />
                <span>Leaderboards</span>
              </button>
            </>
          )}
        </nav>
        
        <div className="sidebar-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {user.role} Portal
              </span>
            </div>
            
            <button onClick={onLogout} className="btn btn-secondary" style={{ width: '100%', gap: '0.5rem' }}>
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

// Helper for the missing icon
const PlusCircleIcon = ({ size }: { size: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </svg>
);
