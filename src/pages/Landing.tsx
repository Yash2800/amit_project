// src/pages/Landing.tsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, 
  ArrowRight, ShieldCheck,
  X, Info, Zap, Layers, MapPin,
  CreditCard, UserCheck, Truck, MessageCircle, Mail, AlertTriangle, Badge,
  Plane, Award, Coffee
} from 'lucide-react';
import { Leaderboards } from '../components/Leaderboards';
import aciLogo from '../assets/aero_club_logo.png';
import dbLogo from '../assets/image.png';
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
  onNavigateToLeaderboard: () => void;
  onNavigateToRules: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigateToAuth, onNavigateToLeaderboard, onNavigateToRules }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [loadingCats, setLoadingCats] = useState(true);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [flashUpdates, setFlashUpdates] = useState<{id: number, message: string}[]>([]);

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

    const fetchUpdates = async () => {
      try {
        const res = await fetch('/api/updates.php');
        const data = await res.json();
        if (data.updates) {
          setFlashUpdates(data.updates);
        }
      } catch (err) {
        console.error("Failed to load updates", err);
      }
    };
    fetchUpdates();

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsNavVisible(false); // scrolling down
      } else {
        setIsNavVisible(true); // scrolling up
      }
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
      <nav 
        className="landing-nav"
        style={{ 
          transform: isNavVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('home')} className="nav-brand">
          <img src={aciLogo} alt="Aero Club" style={{ height: '40px', width: 'auto' }} />
        </span>
        <div className="nav-links">
          <span className="nav-link" onClick={() => scrollToSection('home')}>Home</span>
          <span className="nav-link" onClick={() => scrollToSection('about')}>Partners</span>
          <span className="nav-link" onClick={() => scrollToSection('categories')}>Categories</span>
          <span className="nav-link" onClick={() => scrollToSection('standings')}>Live Standings</span>
          <span className="nav-link" onClick={() => scrollToSection('schedule')}>Schedule</span>
          <span className="nav-link" onClick={onNavigateToRules} style={{ color: 'var(--primary)' }}>Rules</span>
        </div>
        <div className="nav-actions">
          <button className="btn-secondary" onClick={onNavigateToLeaderboard} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={16} /> Leaderboard
          </button>
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
              <span>National Aeromodelling Championship 2026</span>
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

      {/* Flash Updates */}
      {flashUpdates.length > 0 && (
        <div className="flash-updates" style={{ background: 'rgba(11, 15, 25, 0.9)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--primary-border)', borderBottom: '1px solid var(--primary-border)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)', zIndex: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', color: '#fff', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', zIndex: 2, boxShadow: '0 0 15px rgba(99,102,241,0.3)' }}>
            <AlertTriangle size={14} /> Flash Update
          </div>
          <div className="ticker-wrap">
            <div className="ticker">
              {flashUpdates.map(u => (
                <span key={`f1-${u.id}`} className="ticker-item"><span className="ticker-dot"></span> {u.message}</span>
              ))}
              {/* Duplicate for infinite loop */}
              {flashUpdates.map(u => (
                <span key={`f2-${u.id}`} className="ticker-item"><span className="ticker-dot"></span> {u.message}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Organizer & Partner Section */}
      <section id="about" className="partners-section">
        <span className="section-tag">Partnership & Governance</span>
        <h2 className="section-title">Organizers & Air Sports Governing Body</h2>
        <div className="partners-grid">
          
          <div className="partner-card">
            <div className="partner-logo-container">
              <img src={aciLogo} alt="Aero Club of India" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h3 className="partner-name">Aero Club of India</h3>
            <p className="partner-desc">
              As the national governing body for air sports in India, the Aero Club of India ensures all technical regulations, safety scrutinies, and flight regulations match global FAI sporting codes.
            </p>
          </div>

          <div className="partner-card">
            <div className="partner-logo-container">
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

      {/* Important Guidelines Section */}
      <section id="guidelines" className="guidelines-section" style={{ padding: '6rem 2rem', background: 'rgba(19, 26, 44, 0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <span className="section-tag" style={{ textAlign: 'center' }}>Must Read</span>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>Important Guidelines & Rules</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>ACI Membership</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                ACI membership is <strong>mandatory</strong> to participate. A 1-year membership will be provided at concessional rates directly at the competition venue.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <CreditCard size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Registration Fee</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                The official registration fee is <strong>INR 1000.00</strong> per participant.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Badge size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Photo ID Cards</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Official Photo Identify cards will be provided to all participants upon successful registration at the venue.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <UserCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Minimum Age</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                The minimum age requirement for participation in the championship is <strong>14 years</strong>.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Category Quorum</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                For a valid competition in any category, a min of <strong>05 participants</strong> with a high degree of aeromodel flying pertaining to that category is mandatory.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Truck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Logistics & Transport</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Depending on regional registration volume, truck containers will be placed at central points for free to & fro transportation of packed models (at owner's risk).
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Coffee size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Meals & Hospitality</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                From <strong>18 Nov to 23 Nov</strong>, Breakfast and Lunch will be provided at the competition venue.
              </p>
            </div>

          </div>
          
          {/* Contact Box */}
          <div className="card" style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Need Clarification?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '500px' }}>
                Please allow 24 to 48 hours for addressing any queries. Contact <strong>Col Amit Mohan Sharma (Meet Director)</strong>.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', background: 'rgba(37, 211, 102, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(37, 211, 102, 0.2)' }}>
                <MessageCircle size={20} style={{ color: '#25D366' }} />
                <span style={{ fontWeight: 600 }}>WhatsApp: +91 769196222</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <Mail size={20} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 600 }}>amsharma22@gmail.com</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Event Schedule */}
      <section id="schedule" style={{ padding: '2rem 4rem 6rem', maxWidth: '1000px', margin: '0 auto' }}>
        <span className="section-tag" style={{ textAlign: 'center', display: 'block', margin: '0 auto 1rem' }}>Event Timeline</span>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>Championship Schedule</h2>
        
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', backdropFilter: 'blur(20px)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(99, 102, 241, 0.1)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--primary)', fontWeight: 700, width: '25%' }}>Date & Day</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--primary)', fontWeight: 700 }}>Time & Activities</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '18 Nov 2026', day: 'Wednesday', time: '1000 to 1700 h', act: 'Arrival, Registration and Unpacking of models.\nLocation - competition venue.' },
                { date: '19 Nov 2026', day: 'Thursday', time: '0600 to 1700 h', act: 'Trial flights, competition and safety briefings.' },
                { date: '20 Nov 2026', day: 'Friday', time: '0600 to 1700 h', act: 'Competition Day 1' },
                { date: '21 Nov 2026', day: 'Saturday', time: '0600 to 1700 h', act: 'Competition Day 2' },
                { date: '22 Nov 2026', day: 'Sunday', time: 'Full Day', act: 'Competition Reserve and Fun Flying day' },
                { date: '23 Nov 2026', day: 'Monday', time: '0600 to 1700 h\n1900 h onwards', act: 'Sightseeing and packing of models.\nPrize Distribution ceremony and Gala Dinner.' },
                { date: '24 Nov 2026', day: 'Tuesday', time: '0600 h onwards', act: 'Departure' },
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{row.date}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{row.day}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {row.act.split('\n').map((line, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, minWidth: '120px', marginTop: '0.15rem' }}>
                            {row.time.split('\n')[i] || ''}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{line}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
