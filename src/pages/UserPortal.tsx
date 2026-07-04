// src/pages/UserPortal.tsx
import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Trophy, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  Plane,
  Save,
  PlusCircle
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  aircraft_type: 'heli' | 'plane' | 'glider' | 'control_line';
  min_specs: {
    min_rotor_dia?: number;
    min_wing_span?: number;
    max_wing_span?: number;
    allowed_engines?: string[];
    min_engine_size_nitro?: string;
    max_engine_size_nitro?: string;
    min_engine_size_petrol?: string;
    max_engine_size_petrol?: string;
    min_motor_kv?: number;
    max_motor_kv?: number;
    max_turbine_thrust?: number;
    min_turbine_thrust?: number;
    notes?: string;
  };
}

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
  // General Profile State
  const [profileForm, setProfileForm] = useState({
    name: user.name || '',
    father_name: user.father_name || '',
    education: user.education || '',
    address: user.address || '',
    experience_plane: user.experience_plane || '',
    experience_heli: user.experience_heli || '',
    experience_glider: user.experience_glider || '',
    experience_jet: user.experience_jet || '',
    competition_exp: user.competition_exp || '',
    judging_exp: user.judging_exp || '',
    models_bringing: user.models_bringing || ''
  });
  
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  const isProfileSaved = !!user.father_name && !!user.address && !!user.education && !user.allow_profile_edit;

  // Sync profile form state when user prop changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        father_name: user.father_name || '',
        education: user.education || '',
        address: user.address || '',
        experience_plane: user.experience_plane || '',
        experience_heli: user.experience_heli || '',
        experience_glider: user.experience_glider || '',
        experience_jet: user.experience_jet || '',
        competition_exp: user.competition_exp || '',
        judging_exp: user.judging_exp || '',
        models_bringing: user.models_bringing || ''
      });
    }
  }, [user]);

  // Model Registration State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [regForm, setRegForm] = useState({
    category_id: '',
    age_group: '21 years to 50 years',
    model_name: '',
    brand: '',
    wing_span: '',
    rotor_dia: '',
    engine_type: '',
    engine_brand: '',
    engine_size: ''
  });
  const [regMessage, setRegMessage] = useState({ type: '', text: '' });
  
  // Dynamic validation warnings state
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // My Submissions State
  const [submissions, setSubmissions] = useState<Registration[]>([]);

  // Fetch data
  useEffect(() => {
    fetchCategories();
    fetchSubmissions();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error(e);
    }
  };

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

  // Profile submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth.php?action=update_profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        onProfileUpdated(data.user);
      } else {
        setProfileMessage({ type: 'danger', text: data.error || 'Failed to update profile' });
      }
    } catch (err) {
      setProfileMessage({ type: 'danger', text: 'Network error occurred' });
    }
  };

  // Handle Category Switch
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    const cat = categories.find(c => c.id === parseInt(catId)) || null;
    setSelectedCat(cat);
    
    // Set default engine type based on category specs
    let defaultEngine = '';
    if (cat?.min_specs?.allowed_engines && cat.min_specs.allowed_engines.length > 0) {
      defaultEngine = cat.min_specs.allowed_engines[0];
    }
    
    setRegForm(prev => ({
      ...prev,
      category_id: catId,
      wing_span: '',
      rotor_dia: '',
      engine_type: defaultEngine,
      engine_brand: '',
      engine_size: ''
    }));
  };

  // Perform dynamic checklist warnings on input change
  useEffect(() => {
    if (!selectedCat) {
      setValidationWarnings([]);
      return;
    }
    
    const warnings: string[] = [];
    const specs = selectedCat.min_specs;
    
    if (selectedCat.aircraft_type === 'heli' && regForm.rotor_dia) {
      const dia = parseFloat(regForm.rotor_dia);
      if (specs.min_rotor_dia && dia < specs.min_rotor_dia) {
        warnings.push(`Main rotor size (${dia}cm) is below the minimum required specification of ${specs.min_rotor_dia}cm.`);
      }
    }
    
    if ((selectedCat.aircraft_type === 'plane' || selectedCat.aircraft_type === 'glider') && regForm.wing_span) {
      const span = parseFloat(regForm.wing_span);
      if (specs.min_wing_span && span < specs.min_wing_span) {
        warnings.push(`Wing span (${span}cm) is below the minimum required specification of ${specs.min_wing_span}cm.`);
      }
      if (specs.max_wing_span && span > specs.max_wing_span) {
        warnings.push(`Wing span (${span}cm) exceeds the maximum allowed limit of ${specs.max_wing_span}cm.`);
      }
    }
    
    if (regForm.engine_type === 'turbine' && regForm.engine_size) {
      const thrust = parseFloat(regForm.engine_size);
      if (specs.max_turbine_thrust && thrust > specs.max_turbine_thrust) {
        warnings.push(`Turbine thrust (${thrust}kg) exceeds the maximum category limit of ${specs.max_turbine_thrust}kg.`);
      }
      if (specs.min_turbine_thrust && thrust < specs.min_turbine_thrust) {
        warnings.push(`Turbine thrust (${thrust}kg) is below the minimum category requirement of ${specs.min_turbine_thrust}kg.`);
      }
    }
    
    if (regForm.engine_type === 'electric' && regForm.engine_size && (specs.min_motor_kv || specs.max_motor_kv)) {
      const kv = parseFloat(regForm.engine_size);
      // Wait, in category 4 & 6, the spec sheet lists "800 kv to max 400 kv"
      // Wait, if it lists max 400kv and min 800kv (which means smaller kv is bigger motor size)
      // We will perform a basic check. Let's compare limits directly:
      if (specs.min_motor_kv && specs.max_motor_kv) {
        // e.g. min 400 and max 800 (let's sort them so we validate correctly)
        const low = Math.min(specs.min_motor_kv, specs.max_motor_kv);
        const high = Math.max(specs.min_motor_kv, specs.max_motor_kv);
        if (kv < low || kv > high) {
          warnings.push(`Motor rating (${kv} KV) is outside the expected scale of ${low} KV to ${high} KV.`);
        }
      } else if (specs.min_motor_kv && kv < specs.min_motor_kv) {
        warnings.push(`Motor rating (${kv} KV) is below the minimum specification of ${specs.min_motor_kv} KV.`);
      }
    }
    
    setValidationWarnings(warnings);
  }, [regForm, selectedCat]);

  // Model registration submit
  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegMessage({ type: '', text: '' });

    if (!regForm.category_id) {
      setRegMessage({ type: 'danger', text: 'Please select a category' });
      return;
    }

    try {
      const payload = {
        category_id: parseInt(regForm.category_id),
        age_group: regForm.age_group,
        model_name: regForm.model_name,
        brand: regForm.brand,
        wing_span: regForm.wing_span ? parseFloat(regForm.wing_span) : null,
        rotor_dia: regForm.rotor_dia ? parseFloat(regForm.rotor_dia) : null,
        engine_type: regForm.engine_type || null,
        engine_brand: regForm.engine_brand || null,
        engine_size: regForm.engine_size || null
      };

      const res = await fetch('/api/registrations.php?action=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        setRegMessage({ type: 'success', text: 'Model registered successfully! Awaiting tech inspection.' });
        setRegForm({
          category_id: '',
          age_group: '21 years to 50 years',
          model_name: '',
          brand: '',
          wing_span: '',
          rotor_dia: '',
          engine_type: '',
          engine_brand: '',
          engine_size: ''
        });
        setSelectedCat(null);
        fetchSubmissions();
        // Redirect to submissions tab after short delay
        setTimeout(() => {
          setActiveTab('my-registrations');
          setRegMessage({ type: '', text: '' });
        }, 1500);
      } else {
        setRegMessage({ type: 'danger', text: data.error || 'Failed to submit registration' });
      }
    } catch (err) {
      setRegMessage({ type: 'danger', text: 'Network error occurred' });
    }
  };

  return (
    <>
      {/* 1. Profile Tab */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h1>Competitor Experience Profile</h1>
            <p>Complete your pilot profile. This data is required by judges and organizers for technical logs.</p>
          </div>

          {profileMessage.text && (
            <div className={`alert alert-${profileMessage.type}`}>
              {profileMessage.text}
            </div>
          )}

          {isProfileSaved ? (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', background: 'rgba(18, 18, 24, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '2.5rem' }}>
              
              {/* Header Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>
                    {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'RC'}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>{user.name}</h2>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Registered Pilot Competitor</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(48, 209, 88, 0.12)', border: '1px solid rgba(48, 209, 88, 0.25)', color: 'var(--success)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                  <CheckCircle2 size={16} />
                  <span>Profile Locked & Verified</span>
                </div>
              </div>

              {/* Grid content */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                
                {/* Column 1: Personal Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Personal Details
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Father's Name</div>
                      <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{user.father_name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Educational Qualification</div>
                      <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{user.education}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Permanent Address</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{user.address}</div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Aeromodelling Experience */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Flight Experience
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>RC Plane</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{user.experience_plane || 'None'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>RC Helicopter</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{user.experience_heli || 'None'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>RC Glider</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{user.experience_glider || 'None'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>RC Jet Turbine</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{user.experience_jet || 'None'}</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Full Width Experiences */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Competition History</div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-primary)', minHeight: '60px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      {user.competition_exp || 'No previous competition history logged.'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Judging History</div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-primary)', minHeight: '60px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      {user.judging_exp || 'No judging records logged.'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Models Being Brought to Event</div>
                  <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1rem 1.25rem', borderRadius: '10px', fontSize: '0.95rem', color: 'var(--text-primary)', border: '1px solid rgba(99, 102, 241, 0.15)', fontWeight: 500 }}>
                    {user.models_bringing}
                  </div>
                </div>
              </div>

              {/* Lock Warning footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>Competitor profiles are finalized upon submission to maintain transparency in records. If you noticed a mistake, request profile unlocking from the chief flight commissioners or event administrators.</span>
              </div>

            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="card">
              <div className="card-title">
                <UserIcon style={{ color: 'var(--primary)' }} />
                <span>General Information</span>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    required 
                    disabled={isProfileSaved}
                  />
                </div>
                <div className="form-group">
                  <label>Father's Name</label>
                  <input 
                    type="text" 
                    value={profileForm.father_name}
                    onChange={(e) => setProfileForm({...profileForm, father_name: e.target.value})}
                    placeholder="Father's Full Name"
                    required 
                    disabled={isProfileSaved}
                  />
                </div>
                <div className="form-group">
                  <label>Educational Qualification</label>
                  <input 
                    type="text" 
                    value={profileForm.education}
                    onChange={(e) => setProfileForm({...profileForm, education: e.target.value})}
                    placeholder="e.g. High School, B.Tech, Graduate"
                    required 
                    disabled={isProfileSaved}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label>Full Address (with Landmark and PIN Code)</label>
                <textarea 
                  rows={3}
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                  placeholder="Complete street address, landmark, city, state and PIN code"
                  required 
                  disabled={isProfileSaved}
                />
              </div>

              <div className="card-title" style={{ marginTop: '2rem' }}>
                <Plane style={{ color: 'var(--accent)' }} />
                <span>Aeromodel Flying Experience (in years & model sizes)</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>RC Plane Experience</label>
                  <input 
                    type="text" 
                    value={profileForm.experience_plane}
                    onChange={(e) => setProfileForm({...profileForm, experience_plane: e.target.value})}
                    placeholder="e.g. 3 years (up to 2m wingspan)"
                    disabled={isProfileSaved}
                  />
                </div>
                <div className="form-group">
                  <label>RC Heli Experience</label>
                  <input 
                    type="text" 
                    value={profileForm.experience_heli}
                    onChange={(e) => setProfileForm({...profileForm, experience_heli: e.target.value})}
                    placeholder="e.g. 1 year (rotor size 1m)"
                    disabled={isProfileSaved}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>RC Glider Experience</label>
                  <input 
                    type="text" 
                    value={profileForm.experience_glider}
                    onChange={(e) => setProfileForm({...profileForm, experience_glider: e.target.value})}
                    placeholder="e.g. 2 years (wingspan 2.5m)"
                    disabled={isProfileSaved}
                  />
                </div>
                <div className="form-group">
                  <label>RC Jet Plane Experience</label>
                  <input 
                    type="text" 
                    value={profileForm.experience_jet}
                    onChange={(e) => setProfileForm({...profileForm, experience_jet: e.target.value})}
                    placeholder="e.g. None or 1 year (turbine thrust 10kg)"
                    disabled={isProfileSaved}
                  />
                </div>
              </div>

              <div className="card-title" style={{ marginTop: '2rem' }}>
                <Trophy style={{ color: 'var(--warning)' }} />
                <span>Competition & Judging Experience</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Competition Experience (Location, Year, Medals won)</label>
                  <textarea 
                    rows={2}
                    value={profileForm.competition_exp}
                    onChange={(e) => setProfileForm({...profileForm, competition_exp: e.target.value})}
                    placeholder="List past events, locations, years, and medals won (if any)"
                    disabled={isProfileSaved}
                  />
                </div>
                <div className="form-group">
                  <label>Judging Experience</label>
                  <textarea 
                    rows={2}
                    value={profileForm.judging_exp}
                    onChange={(e) => setProfileForm({...profileForm, judging_exp: e.target.value})}
                    placeholder="Details of judging past aeromodelling contests (if any)"
                    disabled={isProfileSaved}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label>How many models do you intend to bring to the competition? (Planes/Helis/Gliders/Jets/Control Line & Sizes)</label>
                <textarea 
                  rows={2}
                  value={profileForm.models_bringing}
                  onChange={(e) => setProfileForm({...profileForm, models_bringing: e.target.value})}
                  placeholder="e.g. 2 Planes (180cm wingspan), 1 Glider (210cm)"
                  required 
                  disabled={isProfileSaved}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', alignSelf: 'flex-start', gap: '0.5rem' }}>
                <Save size={18} />
                <span>Save Profile</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* 2. Register Model Tab */}
      {activeTab === 'register-model' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h1>Register RC Model & Aircraft</h1>
            <p>Submit details for your aircraft model. Your entries will be validated against technical rules.</p>
          </div>

          {regMessage.text && (
            <div className={`alert alert-${regMessage.type}`}>
              {regMessage.text}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 400px)', gap: '2rem', alignItems: 'start' }}>
            <form onSubmit={handleRegSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card-title">
                <PlusCircle style={{ color: 'var(--primary)' }} />
                <span>Aircraft Specifications Form</span>
              </div>

              <div className="form-group">
                <label>Select Competition Category</label>
                <select 
                  value={regForm.category_id}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Age Group Division</label>
                <select 
                  value={regForm.age_group}
                  onChange={(e) => setRegForm({...regForm, age_group: e.target.value})}
                  required
                >
                  <option value="20 years and below">20 years and below (Junior)</option>
                  <option value="21 years to 50 years">21 years to 50 years (Senior)</option>
                  <option value="51 years and above">51 years and above (Veteran)</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Model Name</label>
                  <input 
                    type="text" 
                    value={regForm.model_name}
                    onChange={(e) => setRegForm({...regForm, model_name: e.target.value})}
                    placeholder="e.g. Edge 540, Trex 700"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Brand / Manufacturer</label>
                  <input 
                    type="text" 
                    value={regForm.brand}
                    onChange={(e) => setRegForm({...regForm, brand: e.target.value})}
                    placeholder="e.g. Align, Horizon Hobby, Scratch Built"
                    required
                  />
                </div>
              </div>

              {selectedCat && (
                <>
                  {/* Dynamic Dimension Inputs based on aircraft type */}
                  <div className="form-row">
                    {selectedCat.aircraft_type === 'heli' ? (
                      <div className="form-group">
                        <label>Main Rotor Diameter (cm)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={regForm.rotor_dia}
                          onChange={(e) => setRegForm({...regForm, rotor_dia: e.target.value})}
                          placeholder="e.g. 135"
                          required
                        />
                      </div>
                    ) : (
                      <div className="form-group">
                        <label>Wing Span (cm)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={regForm.wing_span}
                          onChange={(e) => setRegForm({...regForm, wing_span: e.target.value})}
                          placeholder="e.g. 185"
                          required={selectedCat.aircraft_type !== 'control_line'} // control line might be any size
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label>Power Plant / Engine Type</label>
                      <select 
                        value={regForm.engine_type}
                        onChange={(e) => setRegForm({...regForm, engine_type: e.target.value})}
                        required
                      >
                        <option value="">-- Choose Type --</option>
                        {selectedCat.min_specs.allowed_engines?.map(eng => (
                          <option key={eng} value={eng}>{eng.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Engine/Motor Brand & Series</label>
                      <input 
                        type="text" 
                        value={regForm.engine_brand}
                        onChange={(e) => setRegForm({...regForm, engine_brand: e.target.value})}
                        placeholder="e.g. O.S. Engine, Castle, Scorpion"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        {regForm.engine_type === 'electric' && 'Motor Rating (KV)'}
                        {regForm.engine_type === 'nitro' && 'Nitro Displacement (cc / cubic)'}
                        {regForm.engine_type === 'petrol' && 'Petrol Size (cc)'}
                        {regForm.engine_type === 'turbine' && 'Thrust Rating (kg)'}
                        {!regForm.engine_type && 'Engine Size'}
                      </label>
                      <input 
                        type="text" 
                        value={regForm.engine_size}
                        onChange={(e) => setRegForm({...regForm, engine_size: e.target.value})}
                        placeholder={
                          regForm.engine_type === 'electric' ? 'e.g. 520' :
                          regForm.engine_type === 'nitro' ? 'e.g. 0.55 or 9.0cc' :
                          regForm.engine_type === 'petrol' ? 'e.g. DLE 35' :
                          regForm.engine_type === 'turbine' ? 'e.g. 9.5' : 'e.g. Size details'
                        }
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ marginTop: '1rem', alignSelf: 'flex-start' }}
              >
                Submit Registration
              </button>
            </form>

            {/* Validation & Specification Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div className="card-title" style={{ fontSize: '1.1rem' }}>
                  <Info size={18} style={{ color: 'var(--primary)' }} />
                  <span>Rulebook Specifications</span>
                </div>
                {selectedCat ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedCat.name}</div>
                    
                    {selectedCat.min_specs.min_rotor_dia && (
                      <div>• Minimum Rotor Size: <span style={{ color: 'var(--accent)' }}>{selectedCat.min_specs.min_rotor_dia} cm</span></div>
                    )}
                    
                    {selectedCat.min_specs.min_wing_span && (
                      <div>• Wing Span: <span style={{ color: 'var(--accent)' }}>
                        {selectedCat.min_specs.min_wing_span} cm {selectedCat.min_specs.max_wing_span ? `to ${selectedCat.min_specs.max_wing_span} cm` : 'minimum'}
                      </span></div>
                    )}
                    
                    {selectedCat.min_specs.allowed_engines && (
                      <div>• Allowed Engines: <span style={{ color: 'var(--accent)', textTransform: 'uppercase' }}>
                        {selectedCat.min_specs.allowed_engines.join(', ')}
                      </span></div>
                    )}

                    {selectedCat.min_specs.min_engine_size_nitro && (
                      <div>• Min Nitro Displacement: <span style={{ color: 'var(--accent)' }}>{selectedCat.min_specs.min_engine_size_nitro}</span></div>
                    )}

                    {selectedCat.min_specs.min_motor_kv && (
                      <div>• Electric Motor Range: <span style={{ color: 'var(--accent)' }}>
                        {selectedCat.min_specs.min_motor_kv} KV {selectedCat.min_specs.max_motor_kv ? `to ${selectedCat.min_specs.max_motor_kv} KV` : 'minimum'}
                      </span></div>
                    )}

                    {selectedCat.min_specs.max_turbine_thrust && (
                      <div>• Max Turbine Thrust: <span style={{ color: 'var(--accent)' }}>{selectedCat.min_specs.max_turbine_thrust} kg</span></div>
                    )}
                    
                    {selectedCat.min_specs.min_turbine_thrust && (
                      <div>• Min Turbine Thrust: <span style={{ color: 'var(--accent)' }}>{selectedCat.min_specs.min_turbine_thrust} kg</span></div>
                    )}
                    
                    {selectedCat.min_specs.notes && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
                        Note: {selectedCat.min_specs.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.9rem' }}>Select a category to view the rulebook specs limits and checklist validation rules.</p>
                )}
              </div>

              {/* Dynamic Warning Card */}
              {selectedCat && (
                <div className="card" style={{ borderLeft: `4px solid ${validationWarnings.length > 0 ? 'var(--danger)' : 'var(--success)'}` }}>
                  <div className="card-title" style={{ fontSize: '1.1rem' }}>
                    {validationWarnings.length > 0 ? (
                      <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
                    ) : (
                      <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                    )}
                    <span>Technical Check Result</span>
                  </div>
                  
                  {validationWarnings.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <p style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.85rem' }}>WARNING: The following details violate rulebook specifications:</p>
                      {validationWarnings.map((w, idx) => (
                        <div key={idx} className="spec-mismatch" style={{ fontSize: '0.85rem' }}>
                          <span>• {w}</span>
                        </div>
                      ))}
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Note: You can submit the form, but your aircraft might fail the commissioner's manual technical inspection.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="spec-match" style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        <span>✓ Spec values are within standard ranges.</span>
                      </div>
                      <p style={{ fontSize: '0.85rem' }}>Your model matches the minimum aircraft criteria for this category.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. My Registrations Tab */}
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
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No registered models yet. Go to "Register Model" to register your first aircraft.
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
