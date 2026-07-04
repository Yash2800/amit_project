// src/pages/AdminPortal.tsx
import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Download,
  Settings
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'commissioner' | 'user';
  father_name: string;
  education: string;
  address: string;
  experience_plane?: string;
  experience_heli?: string;
  experience_glider?: string;
  experience_jet?: string;
  models_bringing?: string;
  allow_profile_edit?: number;
  assignments: { category_id: number; category_name: string }[];
}

interface Registration {
  id: number;
  user_name: string;
  user_email: string;
  user_role: string;
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
  score_total: number | null;
  status: 'pending' | 'approved' | 'rejected';
}

interface Category {
  id: number;
  name: string;
  aircraft_type: string;
  min_specs: any;
}

interface AdminPortalProps {
  activeTab: string;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  activeTab
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Editing Categories State
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    aircraft_type: 'plane',
    min_specs: {
      min_rotor_dia: '',
      min_wing_span: '',
      max_wing_span: '',
      allowed_engines: 'nitro,electric',
      min_engine_size_nitro: '',
      min_motor_kv: '',
      notes: ''
    }
  });

  // Assignment Modal State
  const [assignUser, setAssignUser] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      
      const [resUsers, resRegs, resCats] = await Promise.all([
        fetch('/api/users.php', { headers }),
        fetch('/api/registrations.php', { headers }),
        fetch('/api/categories.php', { headers })
      ]);

      const dataUsers = await resUsers.json();
      const dataRegs = await resRegs.json();
      const dataCats = await resCats.json();

      if (dataUsers.users) setUsers(dataUsers.users);
      if (dataRegs.registrations) setRegistrations(dataRegs.registrations);
      if (dataCats.categories) setCategories(dataCats.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Role modification
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch('/api/users.php?action=update_role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ user_id: userId, role: newRole })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchData();
      } else {
        alert(data.error || 'Failed to update role');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnlockProfile = async (userId: number) => {
    try {
      const res = await fetch('/api/users.php?action=unlock_profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, allow_profile_edit: 1 } : u));
      } else {
        alert(data.error || 'Failed to unlock profile');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Category Assignments for Commissioners
  const handleAddAssignment = async (userId: number, catId: number) => {
    try {
      const res = await fetch('/api/users.php?action=assign_commissioner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ user_id: userId, category_id: catId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchData();
        // Update local assign modal user pointer to keep screen updated
        setUsers(prev => prev.map(u => {
          if (u.id === userId) {
            const addedCat = categories.find(c => c.id === catId);
            return {
              ...u,
              assignments: [...u.assignments, { category_id: catId, category_name: addedCat?.name || '' }]
            };
          }
          return u;
        }));
        setAssignUser(prev => {
          if (prev && prev.id === userId) {
            const addedCat = categories.find(c => c.id === catId);
            return {
              ...prev,
              assignments: [...prev.assignments, { category_id: catId, category_name: addedCat?.name || '' }]
            };
          }
          return prev;
        });
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveAssignment = async (userId: number, catId: number) => {
    try {
      const res = await fetch('/api/users.php?action=remove_commissioner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ user_id: userId, category_id: catId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchData();
        // Update local modal user pointer
        setUsers(prev => prev.map(u => {
          if (u.id === userId) {
            return {
              ...u,
              assignments: u.assignments.filter(a => a.category_id !== catId)
            };
          }
          return u;
        }));
        setAssignUser(prev => {
          if (prev && prev.id === userId) {
            return {
              ...prev,
              assignments: prev.assignments.filter(a => a.category_id !== catId)
            };
          }
          return prev;
        });
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Registration Status Approval
  const handleStatusChange = async (regId: number, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/registrations.php?action=update_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id: regId, status })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchData();
      } else {
        alert(data.error || 'Failed to update registration status');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CSV Data Export
  const exportCSV = () => {
    if (registrations.length === 0) return;
    
    const headers = [
      'Registration ID', 'Pilot Name', 'Email', 'Age Group', 
      'Category Name', 'Model Brand', 'Model Name', 
      'Wingspan', 'Rotor Dia', 'Engine Type', 'Engine Size', 
      'Tech Status', 'Admin Status', 'Total Score'
    ];

    const rows = registrations.map(r => [
      r.id,
      `"${r.user_name}"`,
      r.user_email,
      `"${r.age_group}"`,
      `"${r.category_name}"`,
      `"${r.brand}"`,
      `"${r.model_name}"`,
      r.wing_span || '',
      r.rotor_dia || '',
      r.engine_type || '',
      `"${r.engine_size || ''}"`,
      r.tech_status,
      r.status,
      r.score_total || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aeromodelling_registrations_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Category Edit and Save handlers
  const handleOpenCatEdit = (cat: Category | null) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({
        name: cat.name,
        aircraft_type: cat.aircraft_type,
        min_specs: {
          min_rotor_dia: cat.min_specs.min_rotor_dia || '',
          min_wing_span: cat.min_specs.min_wing_span || '',
          max_wing_span: cat.min_specs.max_wing_span || '',
          allowed_engines: cat.min_specs.allowed_engines?.join(',') || 'nitro,electric',
          min_engine_size_nitro: cat.min_specs.min_engine_size_nitro || '',
          min_motor_kv: cat.min_specs.min_motor_kv || '',
          notes: cat.min_specs.notes || ''
        }
      });
    } else {
      setEditingCat(null);
      setCatForm({
        name: '',
        aircraft_type: 'plane',
        min_specs: {
          min_rotor_dia: '',
          min_wing_span: '',
          max_wing_span: '',
          allowed_engines: 'nitro,electric',
          min_engine_size_nitro: '',
          min_motor_kv: '',
          notes: ''
        }
      });
    }
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    const specsPayload: any = {
      allowed_engines: catForm.min_specs.allowed_engines.split(',').map(s => s.trim().toLowerCase()),
      notes: catForm.min_specs.notes
    };
    
    if (catForm.min_specs.min_rotor_dia) specsPayload.min_rotor_dia = parseFloat(catForm.min_specs.min_rotor_dia);
    if (catForm.min_specs.min_wing_span) specsPayload.min_wing_span = parseFloat(catForm.min_specs.min_wing_span);
    if (catForm.min_specs.max_wing_span) specsPayload.max_wing_span = parseFloat(catForm.min_specs.max_wing_span);
    if (catForm.min_specs.min_engine_size_nitro) specsPayload.min_engine_size_nitro = catForm.min_specs.min_engine_size_nitro;
    if (catForm.min_specs.min_motor_kv) specsPayload.min_motor_kv = parseInt(catForm.min_specs.min_motor_kv);

    const isEdit = editingCat !== null;
    const url = `/api/categories.php?action=${isEdit ? 'update' : 'create'}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: isEdit ? editingCat.id : undefined,
          name: catForm.name,
          aircraft_type: catForm.aircraft_type,
          min_specs: specsPayload
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setEditingCat(null);
        fetchData();
      } else {
        alert(data.error || 'Failed to save category');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Category Delete
  const handleDeleteCat = async (catId: number) => {
    if (!confirm('Are you sure you want to delete this category? All registrations in it will fail constraints.')) return;
    try {
      const res = await fetch('/api/categories.php?action=delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id: catId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchData();
      } else {
        alert(data.error || 'Failed to delete category');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Stats computing
  const stats = {
    totalUsers: users.length,
    totalRegs: registrations.length,
    approvedRegs: registrations.filter(r => r.status === 'approved').length,
    pendingTech: registrations.filter(r => r.tech_status === 'pending').length
  };

  return (
    <>
      {/* 1. Analytics Dashboard */}
      {activeTab === 'admin-stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h1>Championship Analytics Dashboard {loading && <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>• Syncing...</span>}</h1>
            <p>High-level metrics, age distributions, and category fill logs for event administrators.</p>
          </div>

          <div className="stat-grid">
            <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <span className="stat-value">{stats.totalUsers}</span>
              <span className="stat-label">Registered Users</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid var(--accent)' }}>
              <span className="stat-value">{stats.totalRegs}</span>
              <span className="stat-label">Model Submissions</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
              <span className="stat-value">{stats.approvedRegs}</span>
              <span className="stat-label">Approved Slots</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
              <span className="stat-value">{stats.pendingTech}</span>
              <span className="stat-label">Pending Tech Checks</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
            {/* Age group distribution */}
            <div className="card">
              <div className="card-title">Age Group Enrollment</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['20 years and below', '21 years to 50 years', '51 years and above'].map(age => {
                  const count = registrations.filter(r => r.age_group === age).length;
                  const pct = stats.totalRegs > 0 ? (count / stats.totalRegs) * 100 : 0;
                  return (
                    <div key={age} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>{age}</span>
                        <strong>{count} pilots</strong>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aircraft category stats */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '350px', overflowY: 'auto' }}>
              <div className="card-title">Registration by Aircraft Class</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {categories.map(cat => {
                  const count = registrations.filter(r => r.category_id === cat.id).length;
                  return (
                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                      <span className="badge badge-info" style={{ height: 'fit-content' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Registrations Tab */}
      {activeTab === 'admin-registrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>Model Submissions & Approvals</h1>
              <p>Review candidate details, inspect values against spec guidelines, and grant admin approval.</p>
            </div>
            <button onClick={exportCSV} className="btn btn-secondary" style={{ gap: '0.5rem' }}>
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Pilot Name</th>
                  <th>Category</th>
                  <th>Model Details</th>
                  <th>Tech Inspection</th>
                  <th>Admin Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No registrations logged.</td>
                  </tr>
                ) : (
                  registrations.map(reg => (
                    <tr key={reg.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{reg.user_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{reg.user_email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{reg.category_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{reg.age_group}</div>
                      </td>
                      <td>
                        <div>{reg.brand} {reg.model_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {reg.wing_span && `Span: ${reg.wing_span}cm `}
                          {reg.rotor_dia && `Rotor: ${reg.rotor_dia}cm `}
                          {reg.engine_type && `(${reg.engine_type.toUpperCase()}: ${reg.engine_size})`}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${
                          reg.tech_status === 'passed' ? 'success' : 
                          reg.tech_status === 'failed' ? 'danger' : 'pending'
                        }`}>
                          {reg.tech_status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${
                          reg.status === 'approved' ? 'success' : 
                          reg.status === 'rejected' ? 'danger' : 'pending'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleStatusChange(reg.id, 'approved')} 
                            className="btn btn-success" 
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                            title="Approve Slot"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleStatusChange(reg.id, 'rejected')} 
                            className="btn btn-danger" 
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                            title="Reject Slot"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. User Directory Tab */}
      {activeTab === 'admin-users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h1>User & Commissioner Directory</h1>
            <p>Manage roles, check pilots experience details, and assign Commissioners to specific categories.</p>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Experience Log</th>
                  <th>Account Role</th>
                  <th>Commissioner Assignments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      {u.father_name && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Father: {u.father_name}</div>}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        {u.experience_plane && <div>• Plane: {u.experience_plane}</div>}
                        {u.experience_heli && <div>• Heli: {u.experience_heli}</div>}
                        {u.experience_glider && <div>• Glider: {u.experience_glider}</div>}
                        {u.experience_jet && <div>• Jet: {u.experience_jet}</div>}
                        {u.models_bringing && <div>• Bringing: {u.models_bringing}</div>}
                      </div>
                    </td>
                    <td>
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                        disabled={u.id === 1} // lock super admin
                      >
                        <option value="user">User / Pilot</option>
                        <option value="commissioner">Commissioner / Judge</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {u.role === 'commissioner' ? (
                          <>
                            {u.assignments.map(a => (
                              <span key={a.category_id} className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', padding: '0.15rem 0.5rem' }}>
                                <span>{a.category_name.slice(0, 15)}...</span>
                                <button 
                                  onClick={() => handleRemoveAssignment(u.id, a.category_id)}
                                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'inline-flex', padding: 0 }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            <button 
                              onClick={() => setAssignUser(u)} 
                              className="btn btn-secondary" 
                              style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem', gap: 0 }}
                            >
                              + Assign
                            </button>
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>N/A (Not Commissioner)</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {u.id === 1 ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Super User</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                          {u.role === 'user' && u.father_name ? (
                            <>
                              {u.allow_profile_edit === 1 ? (
                                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Editable</span>
                              ) : (
                                <>
                                  <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>Locked</span>
                                  <button
                                    onClick={() => handleUnlockProfile(u.id)}
                                    className="btn btn-primary"
                                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', gap: '0.2rem', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: 'var(--primary)' }}
                                  >
                                    Unlock Profile
                                  </button>
                                </>
                              )}
                            </>
                          ) : u.role === 'user' ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No Profile Yet</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>--</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Manage Categories Tab */}
      {activeTab === 'admin-categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>Manage Aircraft Classes</h1>
              <p>Configure category tags, constraints, wing span boundaries, and engine size limits.</p>
            </div>
            <button onClick={() => handleOpenCatEdit(null)} className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <PlusCircle size={16} />
              <span>Add Category</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: editingCat !== null || catForm.name === '' && editingCat === null ? '1fr' : '1fr 380px', gap: '2rem', alignItems: 'start' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Category ID</th>
                    <th>Category Name</th>
                    <th>Aircraft Type</th>
                    <th>Specs Threshold Checklist</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td style={{ fontWeight: 700 }}>#{cat.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{cat.name}</div>
                      </td>
                      <td style={{ textTransform: 'uppercase', fontSize: '0.85rem' }}>{cat.aircraft_type}</td>
                      <td>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {cat.min_specs.min_wing_span && `Min Wing: ${cat.min_specs.min_wing_span}cm `}
                          {cat.min_specs.max_wing_span && `Max Wing: ${cat.min_specs.max_wing_span}cm `}
                          {cat.min_specs.min_rotor_dia && `Min Rotor: ${cat.min_specs.min_rotor_dia}cm `}
                          {cat.min_specs.allowed_engines && `Engines: ${cat.min_specs.allowed_engines.join(',')}`}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleOpenCatEdit(cat)} 
                            className="btn btn-secondary" 
                            style={{ padding: '0.35rem 0.5rem' }}
                            title="Edit Category"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCat(cat.id)} 
                            className="btn btn-danger" 
                            style={{ padding: '0.35rem 0.5rem' }}
                            title="Delete Category"
                            disabled={cat.id <= 15} // protect core seeded data
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Category Form Column (Displays when creating/editing) */}
            {(editingCat !== null || (catForm.name === '' && editingCat === null)) && (
              <form onSubmit={handleSaveCat} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="card-title">
                  <Settings size={18} style={{ color: 'var(--primary)' }} />
                  <span>{editingCat ? `Edit Category #${editingCat.id}` : 'Create New Category'}</span>
                </div>
                
                <div className="form-group">
                  <label>Category Name</label>
                  <input 
                    type="text" 
                    value={catForm.name} 
                    onChange={(e) => setCatForm({...catForm, name: e.target.value})} 
                    placeholder="e.g. RC Plane Freestyle Petrol Engine"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Aircraft Class Type</label>
                  <select 
                    value={catForm.aircraft_type}
                    onChange={(e) => setCatForm({...catForm, aircraft_type: e.target.value})}
                  >
                    <option value="plane">RC Plane</option>
                    <option value="heli">RC Heli</option>
                    <option value="glider">RC Glider</option>
                    <option value="control_line">Control Line Model</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Min Wingspan (cm)</label>
                    <input 
                      type="number" 
                      value={catForm.min_specs.min_wing_span} 
                      onChange={(e) => setCatForm({
                        ...catForm, 
                        min_specs: {...catForm.min_specs, min_wing_span: e.target.value}
                      })} 
                      placeholder="e.g. 165"
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Wingspan (cm)</label>
                    <input 
                      type="number" 
                      value={catForm.min_specs.max_wing_span} 
                      onChange={(e) => setCatForm({
                        ...catForm, 
                        min_specs: {...catForm.min_specs, max_wing_span: e.target.value}
                      })} 
                      placeholder="e.g. 200"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Min Rotor Size (cm)</label>
                    <input 
                      type="number" 
                      value={catForm.min_specs.min_rotor_dia} 
                      onChange={(e) => setCatForm({
                        ...catForm, 
                        min_specs: {...catForm.min_specs, min_rotor_dia: e.target.value}
                      })} 
                      placeholder="e.g. 124"
                    />
                  </div>
                  <div className="form-group">
                    <label>Allowed Engine Types</label>
                    <input 
                      type="text" 
                      value={catForm.min_specs.allowed_engines} 
                      onChange={(e) => setCatForm({
                        ...catForm, 
                        min_specs: {...catForm.min_specs, allowed_engines: e.target.value}
                      })} 
                      placeholder="nitro,electric,petrol,turbine"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Rules Guidelines/Remarks</label>
                  <textarea 
                    rows={2}
                    value={catForm.min_specs.notes}
                    onChange={(e) => setCatForm({
                      ...catForm, 
                      min_specs: {...catForm.min_specs, notes: e.target.value}
                    })}
                    placeholder="General inspection instructions..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => handleOpenCatEdit(null)} className="btn btn-secondary">
                    Clear / Create Mode
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCat ? 'Save Changes' : 'Create Class'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Commissioner Assignments Modal */}
      {assignUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Assign Categories to Commissioner
            </h2>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Select which competition categories <strong>{assignUser.name}</strong> will manage.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem' }}>
              {categories.map(cat => {
                const isAssigned = assignUser.assignments.some(a => a.category_id === cat.id);
                return (
                  <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{cat.name}</span>
                    {isAssigned ? (
                      <button 
                        onClick={() => handleRemoveAssignment(assignUser.id, cat.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Remove
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAddAssignment(assignUser.id, cat.id)}
                        className="btn btn-success"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setAssignUser(null)} className="btn btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
