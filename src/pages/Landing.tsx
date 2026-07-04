// src/pages/Landing.tsx
import React, { useState, useEffect } from 'react';
import { 
  Plane, Award, Calendar, ArrowRight, 
  X, Info, Zap, Layers, MapPin 
} from 'lucide-react';
import { Leaderboards } from '../components/Leaderboards';
import aciLogo from '../assets/aci_logo.png';
import dbLogo from '../assets/db_logo.png';
import heroBanner from '../assets/aerobatics_hero.png';

interface Category {
  id: number;
  name: string;
  aircraft_type: string;
  min_specs: {
    min_rotor_dia?: number;
    allowed_engines?: string[];
    min_engine_size_nitro?: string;
    max_engine_size_nitro?: string;
    min_motor_kv?: number;
    max_motor_kv?: number;
    min_wing_span?: number;
    max_wing_span?: number;
    min_engine_size_petrol?: string;
    max_engine_size_petrol?: string;
    max_turbine_thrust?: number;
    min_turbine_thrust?: number;
    notes?: string;
  };
}

interface LandingProps {
  onNavigateToAuth: (tab: 'login' | 'register') => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigateToAuth }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/categories.php');
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, []);

  const getAircraftIcon = (type: string) => {
    switch (type) {
      case 'heli':
        return <Zap size={24} style={{ color: 'var(--accent)' }} />;
      case 'plane':
        return <Plane size={24} style={{ color: 'var(--primary)' }} />;
      case 'glider':
        return <Layers size={24} style={{ color: 'var(--success)' }} />;
      default:
        return <Plane size={24} style={{ color: 'var(--warning)' }} />;
    }
  };

  const getReadableType = (type: string) => {
    switch (type) {
      case 'heli': return 'Helicopter';
      case 'plane': return 'Fixed-Wing Plane';
      case 'glider': return 'Glider';
      case 'control_line': return 'Control Line';
      default: return type;
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* Sticky Navigation Bar */}
      <nav className="landing-nav">
        <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('home')} className="nav-brand">
          <Plane size={28} style={{ transform: 'rotate(-45deg)' }} />
          <span>AERO CHAMPIONSHIP</span>
        </span>
        <div className="nav-links">
          <span className="nav-link" onClick={() => scrollToSection('home')}>Home</span>
          <span className="nav-link" onClick={() => scrollToSection('about')}>Partners</span>
          <span className="nav-link" onClick={() => scrollToSection('categories')}>Categories</span>
          <span className="nav-link" onClick={() => scrollToSection('standings')}>Live Standings</span>
          <span className="nav-link" onClick={() => scrollToSection('schedule')}>Schedule</span>
        </div>
        <div className="nav-actions">
          <button className="btn-outline-premium" onClick={() => onNavigateToAuth('login')}>
            Sign In
          </button>
          <button className="btn-premium" onClick={() => onNavigateToAuth('register')}>
            Register Now
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="home" className="hero-section">
        <div className="hero-overlay"></div>
        <div 
          style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 1fr', 
            gap: '4rem', 
            alignItems: 'center', 
            textAlign: 'left',
            zIndex: 10,
            width: '100%'
          }}
        >
          <div className="hero-content" style={{ alignItems: 'flex-start', textAlign: 'left', margin: 0 }}>
            <div className="hero-badge animate-float">
              <Award size={14} />
              <span>National Aeromodelling Event 2026</span>
            </div>
            <h1 className="hero-title" style={{ textAlign: 'left', fontSize: '3.5rem' }}>
              Where Speed Meets the Sky:<br />
              <span>Aeromodelling Championship</span>
            </h1>
            <p className="hero-description" style={{ textAlign: 'left' }}>
              Experience the ultimate test of flying skill, aircraft design, and engineering precision. Organised under the governance of the <strong>Aero Club of India</strong> and held in unity with <strong>Dainik Bhaskar</strong>.
            </p>
            <div className="hero-actions">
              <button className="btn-premium" onClick={() => onNavigateToAuth('register')} style={{ padding: '1rem 2.25rem', fontSize: '1.05rem' }}>
                Register as Competitor
                <ArrowRight size={18} />
              </button>
              <button className="btn-outline-premium" onClick={() => scrollToSection('categories')} style={{ padding: '1rem 2.25rem', fontSize: '1.05rem' }}>
                Explore Categories
              </button>
            </div>

            <div className="hero-stats" style={{ justifyContent: 'flex-start', borderTop: '1px solid rgba(255,255,255,0.08)', width: '100%', padding: '2rem 0 0 0', marginTop: '3rem' }}>
              <div className="hero-stat-item" style={{ alignItems: 'flex-start' }}>
                <span className="hero-stat-num">14+</span>
                <span className="hero-stat-label">Air Categories</span>
              </div>
              <div className="hero-stat-item" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '0 2.5rem', alignItems: 'flex-start' }}>
                <span className="hero-stat-num">₹5,00,000+</span>
                <span className="hero-stat-label">Prize Pool</span>
              </div>
              <div className="hero-stat-item" style={{ alignItems: 'flex-start' }}>
                <span className="hero-stat-num">Live</span>
                <span className="hero-stat-label">Scoring</span>
              </div>
            </div>
          </div>

          <div className="hero-image-container animate-float" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '440px', padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', backdropFilter: 'blur(10px)', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8)' }}>
              <img 
                src={heroBanner} 
                alt="Aerobatics Event" 
                style={{ 
                  width: '100%', 
                  borderRadius: '18px', 
                  display: 'block', 
                  objectFit: 'cover'
                }} 
              />
              <div style={{ position: 'absolute', bottom: '24px', right: '24px', background: 'rgba(11, 15, 25, 0.85)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '0.6rem 1.25rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={16} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Aero Club Approved</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Organizer & Partner Section */}
      <section id="about" className="partners-section">
        <span className="section-tag">Partnership & Governance</span>
        <h2 className="section-title">Organizers & Air Sports Governing Body</h2>
        <div className="partners-grid">
          
          <div className="partner-card">
            <div className="partner-logo-container" style={{ background: '#ffffff', padding: '0.5rem', overflow: 'hidden' }}>
              <img src={aciLogo} alt="Aero Club of India" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h3 className="partner-name">Aero Club of India</h3>
            <p className="partner-desc">
              As the national governing body for air sports in India, the Aero Club of India ensures all technical regulations, safety scrutinies, and flight regulations match global FAI sporting codes.
            </p>
          </div>

          <div className="partner-card">
            <div className="partner-logo-container" style={{ background: '#ffffff', padding: '0.5rem', overflow: 'hidden' }}>
              <img src={dbLogo} alt="Dainik Bhaskar" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h3 className="partner-name">Dainik Bhaskar</h3>
            <p className="partner-desc">
              Organized in unity with India's leading media conglomerate, bringing widespread coverage, global visibility, and bringing communities together to promote STEM education and aviation technology.
            </p>
          </div>

        </div>
      </section>

      {/* Interactive Categories Explorer */}
      <section id="categories" className="categories-section">
        <span className="section-tag" style={{ textAlign: 'center' }}>Event Lineup</span>
        <h2 className="section-title" style={{ textAlign: 'center' }}>Aircraft Categories & Rules Explorer</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '650px', margin: '-2rem auto 3rem auto' }}>
          Select any competition class below to view the official technical rules, weight constraints, wingspan restrictions, and engine requirements.
        </p>

        {loadingCats ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Loading aircraft categories...
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((cat) => (
              <div key={cat.id} className="cat-card" onClick={() => setSelectedCat(cat)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="cat-type">{getReadableType(cat.aircraft_type)}</div>
                  {getAircraftIcon(cat.aircraft_type)}
                </div>
                <h3 className="cat-title">{cat.name}</h3>
                <div className="cat-explore-link">
                  <span>View Specifications</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Live Standings Preview Section */}
      <section id="standings" className="standings-section" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="section-tag" style={{ textAlign: 'center' }}>Realtime Standings</span>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Championship Standings</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          Live scores updated directly by the scoring commissioners at the airfield. View official rankings filtered by aircraft category and age divisions.
        </p>
        <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'rgba(19,26,44,0.4)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Leaderboards />
        </div>
      </section>

      {/* Event Timeline / Process */}
      <section id="schedule" className="timeline-section">
        <span className="section-tag" style={{ textAlign: 'center' }}>Competition Flow</span>
        <h2 className="section-title" style={{ textAlign: 'center' }}>Event Path & Timeline</h2>
        <div className="timeline-grid">
          
          <div className="timeline-card">
            <div className="timeline-badge">1</div>
            <h3 className="timeline-title">Pilot Registration</h3>
            <p className="timeline-desc">Pilots register online, submit flight history, education, and specific model details including engine sizing and dimensions.</p>
          </div>

          <div className="timeline-card">
            <div className="timeline-badge">2</div>
            <h3 className="timeline-title">Admin Approval</h3>
            <p className="timeline-desc">Event administrators verify the pilot's profile, educational context, and validate initial paperwork approvals.</p>
          </div>

          <div className="timeline-card">
            <div className="timeline-badge">3</div>
            <h3 className="timeline-title">Technical Scrutiny</h3>
            <p className="timeline-desc">On-field technical commissioners measure wingspans, rotor diameters, and engine size to match database specifications.</p>
          </div>

          <div className="timeline-card">
            <div className="timeline-badge">4</div>
            <h3 className="timeline-title">Championship Flights</h3>
            <p className="timeline-desc">Flight trials commence. Judges award flight points (Flight 1 & 2, Freestyle, and Landing precision) in realtime.</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#070a10', borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '4rem 4rem 2rem 4rem', fontSize: '0.9rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.25rem', color: '#fff', marginBottom: '1rem' }}>
              <Plane size={24} style={{ color: 'var(--primary)', transform: 'rotate(-45deg)' }} />
              <span>National Aeromodelling 2026</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: '1.5' }}>
              Organised in unity with Dainik Bhaskar and regulated under the technical oversight of the Aero Club of India.
            </p>
          </div>
          
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem' }}>Venue & Date</h4>
            <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <MapPin size={14} style={{ color: 'var(--primary)' }} />
              <span>Safdarjung Airport Ground, New Delhi</span>
            </p>
            <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={14} style={{ color: 'var(--accent)' }} />
              <span>October 12th - 16th, 2026</span>
            </p>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem' }}>Portal Access</h4>
            <button className="btn-premium" onClick={() => onNavigateToAuth('login')} style={{ padding: '0.6rem 1.25rem' }}>
              Competitor Login
            </button>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '3rem auto 0 auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          &copy; 2026 Aero Club of India & Dainik Bhaskar Union Event. All Rights Reserved. Technical System by AeroManager.
        </div>
      </footer>

      {/* Specifications Modal */}
      {selectedCat && (
        <div className="spec-modal-overlay" onClick={() => setSelectedCat(null)}>
          <div className="spec-modal" onClick={(e) => e.stopPropagation()}>
            <div className="spec-modal-header">
              <div>
                <span className="cat-type">{getReadableType(selectedCat.aircraft_type)} Class</span>
                <h3 className="spec-modal-title">{selectedCat.name}</h3>
              </div>
              <button className="spec-modal-close" onClick={() => setSelectedCat(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ margin: '1.5rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', marginBottom: '1.5rem' }}>
                <Info size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Minimum technical scrutiny parameters are checked on-site.</span>
              </div>

              <table className="spec-info-table">
                <tbody>
                  {selectedCat.min_specs.min_rotor_dia && (
                    <tr>
                      <td className="spec-label">Min Rotor Dia</td>
                      <td className="spec-value">{selectedCat.min_specs.min_rotor_dia} cm</td>
                    </tr>
                  )}
                  {selectedCat.min_specs.min_wing_span && (
                    <tr>
                      <td className="spec-label">Min Wingspan</td>
                      <td className="spec-value">{selectedCat.min_specs.min_wing_span} cm</td>
                    </tr>
                  )}
                  {selectedCat.min_specs.max_wing_span && (
                    <tr>
                      <td className="spec-label">Max Wingspan</td>
                      <td className="spec-value">{selectedCat.min_specs.max_wing_span} cm</td>
                    </tr>
                  )}
                  {selectedCat.min_specs.allowed_engines && (
                    <tr>
                      <td className="spec-label">Allowed Power</td>
                      <td className="spec-value" style={{ textTransform: 'capitalize' }}>
                        {selectedCat.min_specs.allowed_engines.join(', ')}
                      </td>
                    </tr>
                  )}
                  {selectedCat.min_specs.min_engine_size_nitro && (
                    <tr>
                      <td className="spec-label">Min Nitro Engine</td>
                      <td className="spec-value">{selectedCat.min_specs.min_engine_size_nitro}</td>
                    </tr>
                  )}
                  {selectedCat.min_specs.max_engine_size_nitro && (
                    <tr>
                      <td className="spec-label">Max Nitro Engine</td>
                      <td className="spec-value">{selectedCat.min_specs.max_engine_size_nitro}</td>
                    </tr>
                  )}
                  {selectedCat.min_specs.min_engine_size_petrol && (
                    <tr>
                      <td className="spec-label">Min Petrol Engine</td>
                      <td className="spec-value">{selectedCat.min_specs.min_engine_size_petrol}</td>
                    </tr>
                  )}
                  {selectedCat.min_specs.max_engine_size_petrol && (
                    <tr>
                      <td className="spec-label">Max Petrol Engine</td>
                      <td className="spec-value">{selectedCat.min_specs.max_engine_size_petrol}</td>
                    </tr>
                  )}
                  {selectedCat.min_specs.min_motor_kv && (
                    <tr>
                      <td className="spec-label">Min Motor (KV)</td>
                      <td className="spec-value">{selectedCat.min_specs.min_motor_kv} KV</td>
                    </tr>
                  )}
                  {selectedCat.min_specs.max_motor_kv && (
                    <tr>
                      <td className="spec-label">Max Motor (KV)</td>
                      <td className="spec-value">{selectedCat.min_specs.max_motor_kv} KV</td>
                    </tr>
                  )}
                  {selectedCat.min_specs.min_turbine_thrust && (
                    <tr>
                      <td className="spec-label">Min Turbine Thrust</td>
                      <td className="spec-value">{selectedCat.min_specs.min_turbine_thrust} kg</td>
                    </tr>
                  )}
                  {selectedCat.min_specs.max_turbine_thrust && (
                    <tr>
                      <td className="spec-label">Max Turbine Thrust</td>
                      <td className="spec-value">{selectedCat.min_specs.max_turbine_thrust} kg</td>
                    </tr>
                  )}
                  {selectedCat.min_specs.notes && (
                    <tr>
                      <td className="spec-label" style={{ verticalAlign: 'top' }}>Special Rules</td>
                      <td className="spec-value">{selectedCat.min_specs.notes}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-premium" onClick={() => setSelectedCat(null)}>
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
