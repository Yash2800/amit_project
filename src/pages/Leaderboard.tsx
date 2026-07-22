import React, { useState, useEffect } from 'react';
import { Trophy, Medal, AlertCircle, ArrowLeft } from 'lucide-react';

interface LeaderboardEntry {
  id: number;
  pilot_name: string;
  score_total: string | number;
}

interface LeaderboardData {
  [category_name: string]: LeaderboardEntry[];
}

export const Leaderboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard.php');
      const data = await res.json();
      if (data.status === 'success') {
        setLeaderboard(data.leaderboard);
      } else {
        setError(data.error || 'Failed to fetch leaderboard data.');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '2rem' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <button onClick={onBack} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Back to Home
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
              <Trophy size={28} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem' }}>Live Leaderboard</h1>
              <span style={{ color: 'var(--text-secondary)' }}>Real-time flight scores and rankings</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            {Object.keys(leaderboard).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <Trophy size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem 0' }}>No Scores Yet</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Competition scoring hasn't begun or no approved pilots have scores logged.</p>
              </div>
            ) : (
              Object.entries(leaderboard).map(([category, entries]) => (
                <div key={category} style={{ background: 'var(--bg-secondary)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                  
                  {/* Category Header */}
                  <div style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>{category}</h2>
                  </div>

                  <div className="table-responsive" style={{ padding: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          <th style={{ padding: '1rem', textAlign: 'center', width: '80px' }}>Rank</th>
                          <th style={{ padding: '1rem', textAlign: 'left' }}>Pilot Name</th>
                          <th style={{ padding: '1rem', textAlign: 'right' }}>Total Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry, index) => {
                          let rankIcon = null;
                          let rankStyle = { color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem' };
                          
                          if (index === 0) {
                            rankIcon = <Medal size={24} color="#FFD700" style={{ filter: 'drop-shadow(0 2px 4px rgba(255,215,0,0.3))' }} />;
                            rankStyle = { color: '#FFD700', fontWeight: 800, fontSize: '1.2rem' };
                          } else if (index === 1) {
                            rankIcon = <Medal size={24} color="#C0C0C0" />;
                            rankStyle = { color: '#C0C0C0', fontWeight: 700, fontSize: '1.1rem' };
                          } else if (index === 2) {
                            rankIcon = <Medal size={24} color="#CD7F32" />;
                            rankStyle = { color: '#CD7F32', fontWeight: 700, fontSize: '1.1rem' };
                          } else {
                            rankIcon = <span>{index + 1}</span>;
                          }

                          return (
                            <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s', background: index === 0 ? 'rgba(255,215,0,0.05)' : 'transparent' }}>
                              <td style={{ padding: '1rem', textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {rankIcon}
                                </div>
                              </td>
                              <td style={{ padding: '1rem', fontWeight: index < 3 ? 700 : 500, fontSize: index === 0 ? '1.2rem' : '1rem' }}>
                                {entry.pilot_name}
                              </td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <span style={rankStyle}>{entry.score_total}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
