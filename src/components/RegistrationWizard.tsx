import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, CheckCircle2, AlertTriangle, Info, 
  PlusCircle, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Trash2, CreditCard
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

interface RegistrationWizardProps {
  user: any;
  onProfileUpdated: (updatedUser: any) => void;
  onComplete: () => void;
}

export const RegistrationWizard: React.FC<RegistrationWizardProps> = ({ user, onProfileUpdated, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Step 1: Personal Data
  const [profileForm, setProfileForm] = useState({
    name: user.name || '',
    father_name: user.father_name || '',
    education: user.education || '',
    address: user.address || '',
    mobile: user.mobile || '',
    experience_plane: user.experience_plane || '',
    experience_heli: user.experience_heli || '',
    experience_glider: user.experience_glider || '',
    experience_jet: user.experience_jet || '',
    competition_exp: user.competition_exp || '',
    aadhar_card: user.aadhar_card || ''
  });

  // Step 2: Age Group
  const [ageGroup, setAgeGroup] = useState('21 years to 50 years');

  // Step 3: Categories & Models
  const [cart, setCart] = useState<any[]>([]);
  const [expandedCat, setExpandedCat] = useState<number | null>(null);
  
  // Local form for the currently expanded category
  const [catForm, setCatForm] = useState({
    model_name: '',
    brand: '',
    wing_span: '',
    rotor_dia: '',
    engine_type: '',
    engine_brand: '',
    engine_size: ''
  });

  // Step 4: Models Bringing
  const [modelsBringing, setModelsBringing] = useState(user.models_bringing || '');

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    fetch('/api/categories.php', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.categories) setCategories(data.categories);
    })
    .catch(console.error);
  }, []);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Category specific logic
  const handleExpandCat = (cat: Category) => {
    if (expandedCat === cat.id) {
      setExpandedCat(null);
    } else {
      setExpandedCat(cat.id);
      let defaultEngine = '';
      if (cat.min_specs.allowed_engines && cat.min_specs.allowed_engines.length > 0) {
        defaultEngine = cat.min_specs.allowed_engines[0];
      }
      setCatForm({
        model_name: '', brand: '', wing_span: '', rotor_dia: '',
        engine_type: defaultEngine, engine_brand: '', engine_size: ''
      });
    }
  };

  const handleAddCategory = (cat: Category, e: React.FormEvent) => {
    e.preventDefault();
    setCart([...cart, { ...catForm, category_id: cat.id, category_name: cat.name, aircraft_type: cat.aircraft_type }]);
    setExpandedCat(null);
  };

  const removeCartItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleSubmitAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
       setGlobalError("Please select and fill at least one category to register.");
       return;
    }
    setShowPaymentModal(true);
  };

  const processPaymentAndSubmit = async () => {
    setIsProcessingPayment(true);
    setGlobalError('');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const paymentId = 'PAY_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // 1. Update Profile
    try {
      const pRes = await fetch('/api/auth.php?action=update_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ...profileForm, models_bringing: modelsBringing })
      });
      const pData = await pRes.json();
      if (pData.status === 'success') {
        onProfileUpdated(pData.user);
      }
    } catch (e) {
      console.error("Profile update failed", e);
    }

    // 2. Submit Registrations
    let successCount = 0;
    for (const item of cart) {
      try {
        const payload = {
          category_id: item.category_id,
          age_group: ageGroup,
          model_name: item.model_name,
          brand: item.brand,
          wing_span: item.wing_span ? parseFloat(item.wing_span) : null,
          rotor_dia: item.rotor_dia ? parseFloat(item.rotor_dia) : null,
          engine_type: item.engine_type || null,
          engine_brand: item.engine_brand || null,
          engine_size: item.engine_size || null,
          payment_status: 'paid',
          payment_id: paymentId
        };
        const rRes = await fetch('/api/registrations.php?action=register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(payload)
        });
        const rData = await rRes.json();
        if (rData.status === 'success') successCount++;
        else console.error("Reg failed", rData.error);
      } catch (e) {
        console.error(e);
      }
    }

    setIsProcessingPayment(false);
    setShowPaymentModal(false);
    onComplete(); // Navigate to submissions
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem', marginBottom: '0.5rem' }}>
          Registration Wizard
        </h1>
      </div>

      {globalError && (
        <div className="alert alert-danger">{globalError}</div>
      )}

      {/* Stepper Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', top: '15px', left: '0', width: `${((currentStep - 1) / 3) * 100}%`, height: '2px', background: 'var(--primary)', zIndex: 0, transition: 'width 0.3s ease' }}></div>
        
        {[1, 2, 3, 4].map(step => (
          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '0.5rem' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: currentStep >= step ? 'var(--primary)' : '#1e293b',
              color: currentStep >= step ? '#fff' : '#64748b',
              border: `2px solid ${currentStep >= step ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
              fontWeight: 'bold', transition: 'all 0.3s ease'
            }}>
              {step < currentStep ? <CheckCircle2 size={16} /> : step}
            </div>
            <span style={{ fontSize: '0.75rem', color: currentStep >= step ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {step === 1 ? 'Personal Data' : step === 2 ? 'Age Group' : step === 3 ? 'Categories' : 'Models'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Personal Data */}
      {currentStep === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="card fade-in">
          <div className="card-title" style={{ marginBottom: '0.5rem' }}>
            <UserIcon style={{ color: 'var(--primary)' }} />
            <span>1. PERSONAL DATA</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
            INSTRUCTIONS – ALL FIELDS NEED TO BE FILLED, PLEASE WRITE NIL AT FIELDS WHICH ARE NOT APPLICABLE
          </p>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Father's Name</label>
              <input type="text" value={profileForm.father_name} onChange={e => setProfileForm({...profileForm, father_name: e.target.value})} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Educational Qualification</label>
              <select value={profileForm.education} onChange={e => setProfileForm({...profileForm, education: e.target.value})} required>
                <option value="">-- Select Qualification --</option>
                <option value="High School">High School</option>
                <option value="Undergraduate (B.A., B.Sc., B.Tech, etc.)">Undergraduate (B.A., B.Sc., B.Tech, etc.)</option>
                <option value="Postgraduate (M.A., M.Sc., M.Tech, etc.)">Postgraduate (M.A., M.Sc., M.Tech, etc.)</option>
                <option value="Doctorate (Ph.D.)">Doctorate (Ph.D.)</option>
                <option value="Diploma">Diploma</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Mob Number with WhatsApp</label>
              <input type="text" value={profileForm.mobile} onChange={e => setProfileForm({...profileForm, mobile: e.target.value})} required />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label>Full Address (with Landmark and PIN Code)</label>
            <textarea rows={2} value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} required />
          </div>
          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>RC Plane Exp (Years & Size)</label>
              <input type="text" value={profileForm.experience_plane} onChange={e => setProfileForm({...profileForm, experience_plane: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>RC Heli Exp (Years & Size)</label>
              <input type="text" value={profileForm.experience_heli} onChange={e => setProfileForm({...profileForm, experience_heli: e.target.value})} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>RC Glider Exp (Years & Size)</label>
              <input type="text" value={profileForm.experience_glider} onChange={e => setProfileForm({...profileForm, experience_glider: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>RC Jet Exp (Years & Size)</label>
              <input type="text" value={profileForm.experience_jet} onChange={e => setProfileForm({...profileForm, experience_jet: e.target.value})} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>RC Competition Exp (Location, Year, Medals)</label>
              <input type="text" value={profileForm.competition_exp} onChange={e => setProfileForm({...profileForm, competition_exp: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Aadhar Card Number</label>
              <input type="text" value={profileForm.aadhar_card} onChange={e => setProfileForm({...profileForm, aadhar_card: e.target.value})} placeholder="12-digit Aadhar number" required pattern="\d{12}" title="Please enter a valid 12-digit Aadhar number" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ gap: '0.5rem' }}>
              NEXT <ArrowRight size={18} />
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Age Group */}
      {currentStep === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="card fade-in">
          <div className="card-title">
            <UserIcon style={{ color: 'var(--primary)' }} />
            <span>2. COMPETITION AGE GROUPS</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {[
              "20 years and below",
              "21 years to 50 years",
              "51 years and above"
            ].map(group => (
              <label key={group} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer', border: ageGroup === group ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)', transition: 'border-color 0.2s' }}>
                <input 
                  type="radio" 
                  name="ageGroup" 
                  value={group} 
                  checked={ageGroup === group} 
                  onChange={() => setAgeGroup(group)} 
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: '1.1rem' }}>{group}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button type="button" onClick={handlePrev} className="btn btn-secondary" style={{ gap: '0.5rem' }}>
              <ArrowLeft size={18} /> BACK
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: '0.5rem' }}>
              NEXT <ArrowRight size={18} />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Categories */}
      {currentStep === 3 && (
        <div className="card fade-in">
          <div className="card-title" style={{ marginBottom: '0.5rem' }}>
            <PlusCircle style={{ color: 'var(--primary)' }} />
            <span>3. COMPETITION CATEGORIES</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
            INSTRUCTIONS – ALLOWED TO PARTICIPATE IN AS MANY CATEGORIES, CLICK THE CATEGORY TO EXPAND. PRESS DONE TO ADD.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {categories.map((cat, idx) => (
              <div key={cat.id} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                <button 
                  type="button" 
                  onClick={() => handleExpandCat(cat)}
                  style={{ 
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    padding: '1rem', background: expandedCat === cat.id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left',
                    fontWeight: expandedCat === cat.id ? 600 : 400, transition: 'background-color 0.2s'
                  }}
                >
                  <span>{idx + 1}. {cat.name}</span>
                  {expandedCat === cat.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {expandedCat === cat.id && (
                  <form onSubmit={(e) => handleAddCategory(cat, e)} style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: 'var(--accent)', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '4px' }}>
                      <strong>Minimum Specifications:</strong> {cat.min_specs.notes || 'None'}
                    </div>
                    
                    <h4 style={{ marginBottom: '0.75rem', color: '#cbd5e1' }}>Model Data</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Model Name</label>
                        <input type="text" value={catForm.model_name} onChange={e => setCatForm({...catForm, model_name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Brand/Company</label>
                        <input type="text" value={catForm.brand} onChange={e => setCatForm({...catForm, brand: e.target.value})} required />
                      </div>
                    </div>
                    
                    {(cat.aircraft_type === 'heli') ? (
                      <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Rotor dia in cm</label>
                        <input type="number" step="0.1" value={catForm.rotor_dia} onChange={e => setCatForm({...catForm, rotor_dia: e.target.value})} required />
                      </div>
                    ) : (
                      <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Wing Span in cm</label>
                        <input type="number" step="0.1" value={catForm.wing_span} onChange={e => setCatForm({...catForm, wing_span: e.target.value})} required={cat.aircraft_type !== 'control_line'} />
                      </div>
                    )}

                    <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: '#cbd5e1' }}>Power Plant Data</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Engine Type</label>
                        <select value={catForm.engine_type} onChange={e => setCatForm({...catForm, engine_type: e.target.value})} required>
                          <option value="">-- Choose Type --</option>
                          {cat.min_specs.allowed_engines?.map(eng => (
                            <option key={eng} value={eng}>{eng.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>
                          {catForm.engine_type === 'electric' ? 'Electric Motor Brand/Company/Series' : 
                           catForm.engine_type === 'turbine' ? 'Turbine Brand/Company' : 
                           catForm.engine_type === 'petrol' ? 'Petrol Engine Brand/Company' : 'Nitro Engine Brand/Company'}
                        </label>
                        <input type="text" value={catForm.engine_brand} onChange={e => setCatForm({...catForm, engine_brand: e.target.value})} required />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>
                        {catForm.engine_type === 'electric' ? 'Electric Motor KV Rating' : 
                         catForm.engine_type === 'turbine' ? 'Turbine thrust' : 
                         catForm.engine_type === 'petrol' ? 'Petrol Engine Size/Cubic capacity' : 'Nitro Engine Size/Cubic capacity'}
                      </label>
                      <input type="text" value={catForm.engine_size} onChange={e => setCatForm({...catForm, engine_size: e.target.value})} required />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                      <button type="submit" className="btn btn-primary" style={{ background: 'var(--success)' }}>DONE / ADD CATEGORY</button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--success)' }}>Added Categories ({cart.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {cart.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.category_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.model_name} • {c.engine_type?.toUpperCase()}</div>
                    </div>
                    <button onClick={() => removeCartItem(i)} className="btn-icon" style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button type="button" onClick={handlePrev} className="btn btn-secondary" style={{ gap: '0.5rem' }}>
              <ArrowLeft size={18} /> BACK
            </button>
            <button type="button" onClick={handleNext} className="btn btn-primary" style={{ gap: '0.5rem' }}>
              NEXT <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: How Many Models */}
      {currentStep === 4 && (
        <form onSubmit={handleSubmitAll} className="card fade-in">
          <div className="card-title" style={{ marginBottom: '0.5rem' }}>
            <Info style={{ color: 'var(--primary)' }} />
            <span>4. MODELS YOU WILL BRING</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
            INSTRUCTIONS – WRITE QUANTITIES IN NUMBERS, GIVE DATA AS ACCURATE AS POSSIBLE, WRITE NIL IN FIELDS WHICH ARE NOT APPLICABLE. PRESS SUBMIT TO SUBMIT THE FORM.
          </p>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>RC Planes and size / RC Helis and size / RC Gliders and size / RC Jet Planes and size / Control line models</label>
            <textarea 
              rows={4} 
              value={modelsBringing} 
              onChange={e => setModelsBringing(e.target.value)} 
              placeholder="e.g. RC Planes 2 (180cm), RC Helis NIL, RC Gliders 1 (210cm)"
              required 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button type="button" onClick={handlePrev} className="btn btn-secondary" style={{ gap: '0.5rem' }}>
              <ArrowLeft size={18} /> BACK
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: '0.5rem', background: 'var(--success)' }}>
              SUBMIT REGISTRATIONS
            </button>
          </div>
        </form>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay fade-in">
          <div className="modal-content card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Registration Payment
            </h2>
            
            <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <CreditCard size={40} />
              </div>
              
              <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--success)' }}>
                ₹{cart.length * 1000}
              </h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                Registration Fee for {cart.length} categor{cart.length > 1 ? 'ies' : 'y'}
              </p>

              {isProcessingPayment ? (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Processing payment securely...</span>
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                  `}} />
                </div>
              ) : (
                <div style={{ width: '100%', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button 
                    onClick={processPaymentAndSubmit}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <CreditCard size={18} />
                    Pay with Card / UPI
                  </button>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '0.75rem' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
