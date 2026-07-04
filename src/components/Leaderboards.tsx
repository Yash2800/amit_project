// src/components/Leaderboards.tsx
import React, { useState, useEffect } from 'react';
import { Trophy, Award, Filter } from 'lucide-react';

interface LeaderboardEntry {
  id: number;
  user_id: number;
  age_group: string;
  model_name: string;
  brand: string;
  score_flight1: number | null;
  score_flight2: number | null;
  score_freestyle: number | null;
  score_landing: number | null;
  score_total: number | null;
  pilot_name: string;
  category_name: string;
}

interface Category {
  id: number;
  name: string;
  aircraft_type: string;
}

export const Leaderboards: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('21 years to 50 years');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      fetchLeaderboard();
    } else {
      setLeaderboard([]);
    }
  }, [selectedCatId, selectedAgeGroup]);

  const fetchCategories = async () => {
    try {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/categories.php', { headers });
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setSelectedCatId(data.categories[0].id.toString());
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const url = `/api/leaderboard.php?category_id=${selectedCatId}&age_group=${encodeURIComponent(selectedAgeGroup)}`;
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(url, { headers });
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1>Championship Leaderboards</h1>
        <p>Real-time official standings for approved models that have passed both administrative and technical screens.</p>
      </div>

      {/* Filters card */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', padding: '1.25rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Filter size={12} />
            <span>Aircraft Category</span>
          </label>
          <select 
            value={selectedCatId} 
            onChange={(e) => setSelectedCatId(e.target.value)}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Filter size={12} />
            <span>Age Division</span>
          </label>
          <select 
            value={selectedAgeGroup} 
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
          >
            <option value="20 years and below">20 years and below (Junior)</option>
            <option value="21 years to 50 years">21 years to 50 years (Senior)</option>
            <option value="51 years and above">51 years and above (Veteran)</option>
          </select>
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Pilot Name</th>
              <th>Aircraft Model</th>
              <th>Flight Scores</th>
              <th>Total Score</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>Fetching standings data...</td>
              </tr>
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No participants have official scores logged for this category division yet.
                </td>
              </tr>
            ) : (
              leaderboard.map((entry, idx) => {
                const rank = idx + 1;
                let rowClass = '';
                if (rank === 1) rowClass = 'lead-row-1';
                else if (rank === 2) rowClass = 'lead-row-2';
                else if (rank === 3) rowClass = 'lead-row-3';

                return (
                  <tr key={entry.id} className={rowClass}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="lead-number">{rank}</span>
                        {rank === 1 && <Trophy size={18} style={{ color: 'var(--warning)' }} />}
                        {rank === 2 && <Award size={18} style={{ color: '#cbd5e1' }} />}
                        {rank === 3 && <Award size={18} style={{ color: '#b45309' }} />}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{entry.pilot_name}</div>
                    </td>
                    <td>
                      <div>{entry.brand} - {entry.model_name}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {entry.score_flight1 !== null && <span>F1: {entry.score_flight1}</span>}
                        {entry.score_flight2 !== null && <span>F2: {entry.score_flight2}</span>}
                        {entry.score_freestyle !== null && <span>Free: {entry.score_freestyle}</span>}
                        {entry.score_landing !== null && <span>Land: {entry.score_landing}</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>
                        {entry.score_total}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
