// src/pages/CommPortal.tsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronRight
} from 'lucide-react';

interface Registration {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  category_id: number;
  category_name: string;
  aircraft_type: 'heli' | 'plane' | 'glider' | 'control_line';
  age_group: string;
  model_name: string;
  brand: string;
  wing_span: number | null;
  rotor_dia: number | null;
  engine_type: string | null;
  engine_brand: string | null;
  engine_size: string | null;
  tech_status: 'pending' | 'passed' | 'failed';
  tech_remarks: string | null;
  score_flight1: number | null;
  score_flight2: number | null;
  score_freestyle: number | null;
  score_landing: number | null;
  score_total: number | null;
  status: 'pending' | 'approved' | 'rejected';
  min_specs: any;
}

interface CommPortalProps {
  activeTab: string;
}

export const CommPortal: React.FC<CommPortalProps> = ({
  activeTab
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tech inspection modal state
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [techChecklist, setTechChecklist] = useState({
    dimensionCheck: false,
    engineCheck: false,
    safetyCheck: false,
    remarks: ''
  });
  const [techMessage, setTechMessage] = useState('');

  // Scoring form state
  const [scoringReg, setScoringReg] = useState<Registration | null>(null);
  const [scores, setScores] = useState({
    score_flight1: '',
    score_flight2: '',
    score_freestyle: '',
    score_landing: ''
  });
  const [scoreMessage, setScoreMessage] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Handle ?scan= URL parameter for QR Boarding Passes
  useEffect(() => {
    if (registrations.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const scanId = urlParams.get('scan');
      if (scanId) {
        const reg = registrations.find(r => r.id.toString() === scanId);
        if (reg) {
          handleOpenTechModal(reg);
          // Clean up URL so it doesn't re-trigger on refresh
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [registrations]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/registrations.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.registrations) {
        setRegistrations(data.registrations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTechModal = (reg: Registration) => {
    setSelectedReg(reg);
    
    // Pre-populate checklist warnings as guideline
    const specs = reg.min_specs;
    let dimValid = true;

    if (reg.aircraft_type === 'heli' && reg.rotor_dia && specs.min_rotor_dia) {
      dimValid = reg.rotor_dia >= specs.min_rotor_dia;
    }
    if ((reg.aircraft_type === 'plane' || reg.aircraft_type === 'glider') && reg.wing_span) {
      if (specs.min_wing_span && reg.wing_span < specs.min_wing_span) dimValid = false;
      if (specs.max_wing_span && reg.wing_span > specs.max_wing_span) dimValid = false;
    }

    setTechChecklist({
      dimensionCheck: dimValid,
      engineCheck: true, // assume true unless modified
      safetyCheck: false,
      remarks: reg.tech_remarks || ''
    });
    setTechMessage('');
  };

  const handleTechSubmit = async (status: 'passed' | 'failed') => {
    if (!selectedReg) return;
    setTechMessage('');

    try {
      const res = await fetch('/api/registrations.php?action=tech_check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: selectedReg.id,
          tech_status: status,
          tech_remarks: techChecklist.remarks
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSelectedReg(null);
        fetchRegistrations();
      } else {
        setTechMessage(data.error || 'Failed to submit inspection');
      }
    } catch (e) {
      setTechMessage('Network error occurred');
    }
  };

  const handleOpenScoringModal = (reg: Registration) => {
    setScoringReg(reg);
    setScores({
      score_flight1: reg.score_flight1 !== null ? reg.score_flight1.toString() : '',
      score_flight2: reg.score_flight2 !== null ? reg.score_flight2.toString() : '',
      score_freestyle: reg.score_freestyle !== null ? reg.score_freestyle.toString() : '',
      score_landing: reg.score_landing !== null ? reg.score_landing.toString() : ''
    });
    setScoreMessage('');
  };

  const handleScoringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringReg) return;
    setScoreMessage('');

    try {
      const res = await fetch('/api/registrations.php?action=score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: scoringReg.id,
          score_flight1: scores.score_flight1 !== '' ? parseFloat(scores.score_flight1) : null,
          score_flight2: scores.score_flight2 !== '' ? parseFloat(scores.score_flight2) : null,
          score_freestyle: scores.score_freestyle !== '' ? parseFloat(scores.score_freestyle) : null,
          score_landing: scores.score_landing !== '' ? parseFloat(scores.score_landing) : null
        })
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        setScoringReg(null);
        fetchRegistrations();
      } else {
        setScoreMessage(data.error || 'Failed to save scores');
      }
    } catch (e) {
      setScoreMessage('Network error occurred');
    }
  };

  // Filter registrations based on search query
  const filteredRegs = registrations.filter(reg => {
    const term = searchQuery.toLowerCase();
    return (
      reg.user_name.toLowerCase().includes(term) ||
      reg.category_name.toLowerCase().includes(term) ||
      reg.model_name.toLowerCase().includes(term) ||
      reg.brand.toLowerCase().includes(term)
    );
  });

  // Calculate live total score for the scoring modal
  const liveTotal = () => {
    let total = 0;
    let count = 0;
    const f1 = parseFloat(scores.score_flight1);
    const f2 = parseFloat(scores.score_flight2);
    const free = parseFloat(scores.score_freestyle);
    const land = parseFloat(scores.score_landing);

    if (!isNaN(f1)) { total += f1; count++; }
    if (!isNaN(f2)) { total += f2; count++; }
    if (!isNaN(free)) { total += free; count++; }
    if (!isNaN(land)) { total += land; count++; }

    return count > 0 ? total.toFixed(1) : '--';
  };

  return (
    <>
      {activeTab === 'comm-checklist' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h1>Technical Specifications Inspection</h1>
            <p>Review submitted aircraft details and confirm compliance with model guidelines and pilot safety rules.</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by pilot, category, or model name..." 
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Pilot Name</th>
                  <th>Category</th>
                  <th>Model Details</th>
                  <th>Submitted Specifications</th>
                  <th>Technical Checklist</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading registrations...</td>
                  </tr>
                ) : filteredRegs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No registrations match search.</td>
                  </tr>
                ) : (
                  filteredRegs.map(reg => (
                    <tr key={reg.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{reg.user_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{reg.user_email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{reg.category_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{reg.age_group}</div>
                      </td>
                      <td>
                        <div>{reg.brand} {reg.model_name}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {reg.wing_span && <div>Wing Span: <span style={{ color: '#fff', fontWeight: 500 }}>{reg.wing_span} cm</span></div>}
                          {reg.rotor_dia && <div>Rotor Dia: <span style={{ color: '#fff', fontWeight: 500 }}>{reg.rotor_dia} cm</span></div>}
                          {reg.engine_type && <div>Power: <span style={{ color: '#fff', fontWeight: 500 }}>{reg.engine_type.toUpperCase()} ({reg.engine_size})</span></div>}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${
                          reg.tech_status === 'passed' ? 'success' : 
                          reg.tech_status === 'failed' ? 'danger' : 'pending'
                        }`}>
                          {reg.tech_status === 'passed' ? 'Passed' : 
                           reg.tech_status === 'failed' ? 'Failed' : 'Awaiting Inspection'}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleOpenTechModal(reg)} 
                          className="btn btn-secondary" 
                          style={{ gap: '0.25rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                        >
                          <span>Inspect</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'comm-scoring' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h1>Flight Scoring Sheets</h1>
            <p>Log scores for approved candidates who have successfully passed technical inspection.</p>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Pilot Name</th>
                  <th>Category</th>
                  <th>Aircraft</th>
                  <th>Admin Status</th>
                  <th>Scores Logged</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Loading registrations...</td>
                  </tr>
                ) : registrations.filter(r => r.tech_status === 'passed').length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No pilots have passed the Technical Inspection yet. Please perform inspections first.
                    </td>
                  </tr>
                ) : (
                  registrations.filter(r => r.tech_status === 'passed').map(reg => (
                    <tr key={reg.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{reg.user_name}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{reg.age_group}</span>
                      </td>
                      <td>{reg.category_name}</td>
                      <td>{reg.brand} {reg.model_name}</td>
                      <td>
                        <span className={`badge badge-${
                          reg.status === 'approved' ? 'success' : 
                          reg.status === 'rejected' ? 'danger' : 'pending'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {reg.score_flight1 !== null && <span>F1: {reg.score_flight1} | </span>}
                          {reg.score_flight2 !== null && <span>F2: {reg.score_flight2} | </span>}
                          {reg.score_freestyle !== null && <span>Free: {reg.score_freestyle} | </span>}
                          {reg.score_landing !== null && <span>Land: {reg.score_landing}</span>}
                          {reg.score_flight1 === null && reg.score_freestyle === null && reg.score_landing === null && (
                            <span style={{ color: 'var(--text-muted)' }}>Awaiting Score Entry</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {reg.score_total !== null ? (
                          <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{reg.score_total}</span>
                        ) : '--'}
                      </td>
                      <td>
                        <button 
                          onClick={() => handleOpenScoringModal(reg)} 
                          className="btn btn-primary"
                          style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                        >
                          Enter Score
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tech Inspection Checklist Modal */}
      {selectedReg && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Aircraft Technical Check
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                <div><strong>Pilot:</strong> {selectedReg.user_name}</div>
                <div><strong>Category:</strong> {selectedReg.category_name}</div>
                <div><strong>Aircraft Model:</strong> {selectedReg.brand} {selectedReg.model_name}</div>
              </div>

              {/* Specs side-by-side details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px dashed var(--border-color)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Rules Check Details</div>
                
                {selectedReg.aircraft_type === 'heli' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <span>Rotor Size Registered: <strong>{selectedReg.rotor_dia} cm</strong></span>
                    <span>Rule Threshold: <strong>Min {selectedReg.min_specs.min_rotor_dia} cm</strong></span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <span>Wing Span Registered: <strong>{selectedReg.wing_span} cm</strong></span>
                    <span>Rule Range: <strong>
                      {selectedReg.min_specs.min_wing_span} {selectedReg.min_specs.max_wing_span ? `- ${selectedReg.min_specs.max_wing_span}` : ''} cm
                    </strong></span>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <span>Engine / Motor Info: <strong>{selectedReg.engine_type?.toUpperCase()} ({selectedReg.engine_size})</strong></span>
                  <span>Allowed Engines: <strong style={{ textTransform: 'uppercase' }}>
                    {selectedReg.min_specs.allowed_engines?.join(', ')}
                  </strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Technical Inspection Checklist</div>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textTransform: 'none', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={techChecklist.dimensionCheck}
                    onChange={(e) => setTechChecklist({...techChecklist, dimensionCheck: e.target.checked})}
                    style={{ width: 'auto' }}
                  />
                  <span>Rotor size / Wing span matches requirements limits.</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textTransform: 'none', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={techChecklist.engineCheck}
                    onChange={(e) => setTechChecklist({...techChecklist, engineCheck: e.target.checked})}
                    style={{ width: 'auto' }}
                  />
                  <span>Engine/motor power displacement and brand specs approved.</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textTransform: 'none', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={techChecklist.safetyCheck}
                    onChange={(e) => setTechChecklist({...techChecklist, safetyCheck: e.target.checked})}
                    style={{ width: 'auto' }}
                  />
                  <span style={{ color: 'var(--warning)' }}>⚠️ Pilot demonstrated capability to execute aerobatics safely.</span>
                </label>
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label>Inspection Remarks / Notes</label>
                <textarea 
                  rows={3}
                  value={techChecklist.remarks}
                  onChange={(e) => setTechChecklist({...techChecklist, remarks: e.target.value})}
                  placeholder="e.g. Dimensions verified. Checked. All seals applied."
                />
              </div>

              {techMessage && <div className="alert alert-danger">{techMessage}</div>}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedReg(null)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleTechSubmit('failed')} 
                className="btn btn-danger"
              >
                Mark Failed
              </button>
              <button 
                onClick={() => handleTechSubmit('passed')} 
                className="btn btn-success"
                disabled={!techChecklist.dimensionCheck || !techChecklist.engineCheck || !techChecklist.safetyCheck}
              >
                Pass Technical Check
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flight Scoring Modal */}
      {scoringReg && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Enter Flight Performance Scores
            </h2>

            <form onSubmit={handleScoringSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.9rem', backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px' }}>
                <div><strong>Pilot:</strong> {scoringReg.user_name} ({scoringReg.age_group})</div>
                <div><strong>Category:</strong> {scoringReg.category_name}</div>
                <div><strong>Model:</strong> {scoringReg.brand} {scoringReg.model_name}</div>
              </div>

              {/* Dynamic Score Inputs depending on category configuration */}
              <div className="form-row">
                <div className="form-group">
                  <label>Flight Maneuvers - Run 1</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="100"
                    value={scores.score_flight1}
                    onChange={(e) => setScores({...scores, score_flight1: e.target.value})}
                    placeholder="Score 0 - 100"
                  />
                </div>
                <div className="form-group">
                  <label>Flight Maneuvers - Run 2</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="100"
                    value={scores.score_flight2}
                    onChange={(e) => setScores({...scores, score_flight2: e.target.value})}
                    placeholder="Score 0 - 100"
                  />
                </div>
              </div>

              {/* Show Freestyle score box if category involves freestyle maneuvers */}
              {(scoringReg.category_name.toLowerCase().includes('freestyle') || scoringReg.category_name.toLowerCase().includes('aerobatics')) && (
                <div className="form-group">
                  <label>Freestyle / Aerobatic Artistic Multiplier</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="50"
                    value={scores.score_freestyle}
                    onChange={(e) => setScores({...scores, score_freestyle: e.target.value})}
                    placeholder="Score 0 - 50"
                  />
                </div>
              )}

              {/* Show landing score for Gliders or specific categories */}
              {(scoringReg.aircraft_type === 'glider' || scoringReg.category_name.toLowerCase().includes('landing')) && (
                <div className="form-group">
                  <label>Spot Landing Accuracy Score</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="50"
                    value={scores.score_landing}
                    onChange={(e) => setScores({...scores, score_landing: e.target.value})}
                    placeholder="Score 0 - 50"
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: 700 }}>Computed Combined Total Score:</span>
                <span className="score-badge">{liveTotal()}</span>
              </div>

              {scoreMessage && <div className="alert alert-danger">{scoreMessage}</div>}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setScoringReg(null)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Save Scores
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
