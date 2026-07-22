// src/pages/UserPortal.tsx
import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode } from 'lucide-react';
import { RegistrationWizard } from '../components/RegistrationWizard';

interface Registration {
  id: number;
  category_id: number;
  category_name: string;
  aircraft_type: string;
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
}

interface UserPortalProps {
  user: any;
  onProfileUpdated: (updatedUser: any) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const UserPortal: React.FC<UserPortalProps> = ({
  user,
  onProfileUpdated,
  activeTab,
  setActiveTab
}) => {
  const [showPassModal, setShowPassModal] = useState<Registration | null>(null);
  const [submissions, setSubmissions] = useState<Registration[]>([]);

  useEffect(() => {
    if (activeTab === 'my-registrations') {
      fetchSubmissions();
    }
  }, [activeTab]);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/registrations.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.registrations) {
        setSubmissions(data.registrations);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {activeTab === 'registration-wizard' && (
        <RegistrationWizard 
          user={user}
          onProfileUpdated={onProfileUpdated}
          onComplete={() => {
            fetchSubmissions();
            setActiveTab('my-registrations');
          }}
        />
      )}

      {activeTab === 'my-registrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h1>My Submission Tracking</h1>
            <p>Track technical checks, admin approvals, and scoring results for your registered aircraft.</p>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Age Division</th>
                  <th>Model Details</th>
                  <th>Admin Status</th>
                  <th>Tech Inspection</th>
                  <th>Scores</th>
                  <th>Total Score</th>
                  <th>Pilot Pass</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No registered models yet. Go to "Registration Form" to register your first aircraft.
                    </td>
                  </tr>
                ) : (
                  submissions.map(sub => (
                    <tr key={sub.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{sub.category_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{sub.aircraft_type}</div>
                      </td>
                      <td>{sub.age_group}</td>
                      <td>
                        <div>{sub.brand} - {sub.model_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {sub.wing_span && `Span: ${sub.wing_span}cm `}
                          {sub.rotor_dia && `Rotor: ${sub.rotor_dia}cm `}
                          {sub.engine_type && `(${sub.engine_type.toUpperCase()}: ${sub.engine_size})`}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${
                          sub.status === 'approved' ? 'success' : 
                          sub.status === 'rejected' ? 'danger' : 'pending'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span className={`badge badge-${
                            sub.tech_status === 'passed' ? 'success' : 
                            sub.tech_status === 'failed' ? 'danger' : 'pending'
                          }`} style={{ alignSelf: 'flex-start' }}>
                            {sub.tech_status === 'passed' ? 'PASSED' : 
                             sub.tech_status === 'failed' ? 'FAILED' : 'PENDING'}
                          </span>
                          {sub.tech_remarks && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              Ref: {sub.tech_remarks}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.85rem' }}>
                          {sub.score_flight1 !== null && <div>Flight 1: {sub.score_flight1}</div>}
                          {sub.score_flight2 !== null && <div>Flight 2: {sub.score_flight2}</div>}
                          {sub.score_freestyle !== null && <div>Freestyle: {sub.score_freestyle}</div>}
                          {sub.score_landing !== null && <div>Landing: {sub.score_landing}</div>}
                          {sub.score_flight1 === null && sub.score_freestyle === null && (
                            <span style={{ color: 'var(--text-muted)' }}>Not scored yet</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {sub.score_total !== null ? (
                          <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.1rem' }}>
                            {sub.score_total}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>--</span>
                        )}
                      </td>
                      <td>
                        {sub.status === 'approved' && (
                          <button 
                            className="btn btn-primary" 
                            onClick={() => setShowPassModal(sub)}
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}
                          >
                            <QrCode size={16} /> ID Pass
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Boarding Pass Modal */}
      {showPassModal && (
        <div className="modal-overlay" onClick={() => setShowPassModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px', textAlign: 'center', padding: '0' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', padding: '2rem 1.5rem 4rem 1.5rem', borderRadius: '12px 12px 0 0', position: 'relative' }}>
              <div style={{ color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '0.5rem' }}>
                Pilot Boarding Pass
              </div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem' }}>{user.name}</h2>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {showPassModal.category_name}
              </div>
            </div>
            
            <div style={{ background: 'var(--bg-secondary)', margin: '-3rem 1.5rem 1.5rem 1.5rem', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative', zIndex: 2 }}>
              <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', display: 'inline-block', marginBottom: '1.25rem' }}>
                <QRCodeCanvas 
                  value={`${window.location.origin}?scan=${showPassModal.id}`} 
                  size={180} 
                  level="H" 
                  fgColor="#000"
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>REG ID</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>#{showPassModal.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>AIRCRAFT</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{showPassModal.brand} {showPassModal.model_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>TECH STATUS</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: showPassModal.tech_status === 'passed' ? 'var(--success)' : (showPassModal.tech_status === 'failed' ? 'var(--danger)' : 'var(--warning)') }}>
                    {showPassModal.tech_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
              <button onClick={() => setShowPassModal(null)} className="btn btn-secondary" style={{ width: '100%' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
