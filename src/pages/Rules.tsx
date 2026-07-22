import React from 'react';
import { Shield, Users, Bus, Trophy, AlertTriangle, ArrowLeft, Plane } from 'lucide-react';

export const Rules: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#f8fafc', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <button 
          onClick={onBack} 
          className="btn-outline-premium" 
          style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <div className="card" style={{ padding: '3rem', marginBottom: '2rem' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Rules and Regulations
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>
            Please carefully read and adhere to all guidelines to ensure a safe and successful event.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* 1. Registration & Identification */}
            <section>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                <Shield size={24} /> 1. Registration & Identification
              </h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>All participants are required to carry an Aadhar Card or a valid government-issued identification document at all times.</li>
                <li>Participants must thoroughly study all rules, regulations, and model parameters for participation prior to arrival to avoid disqualification.</li>
                <li>Suggestions to make the event a grand success or to facilitate better participation are always welcome. Please share them with the Meet Director, Col. Amit Mohan Sharma.</li>
              </ul>
            </section>

            {/* 2. Wingman Policy */}
            <section>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                <Users size={24} /> 2. Wingman Policy
              </h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Every pilot must be accompanied by an assistant (Wingman) while participating in the competition.</li>
                <li>All Wingmen must register with the Aero Club of India alongside the pilot, pay the applicable registration fee, and bear all expenses equivalent to those of the pilots.</li>
                <li>A duly registered Wingman is permitted to act as an assistant for multiple pilots.</li>
                <li>Children of the age group 14 to 16 participating in this competition will be allowed to bring upto three family members in addition to a Wingman, in case the family members are not in a position to perform the duties of Wingman. The family members are not required to register to the competition or for Aero Club of India membership, if they are not acting as Wingman, however, they will be provided all facilities at the rates applicable to pilots. If more that one family member is accompanying the pilot, the pilot needs to inform the same via email (nataerodcomp2026@gmail.com) min 30 days in advance giving all details like name age gender, aadhar card number, mob number, date and time of arrival, date and time of departure etc.</li>
              </ul>
            </section>

            {/* 3. Safety & Technical Checks */}
            <section>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                <AlertTriangle size={24} /> 3. Safety & Technical Checks
              </h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>During competition and fun-fly events, the safety of aeromodels, fellow competitors, and the public is of paramount importance.</li>
                <li>Violations of safety rules will be dealt with strictly and may lead to immediate disqualification from the competition.</li>
                <li>Every model will undergo a detailed technical inspection by experts before every takeoff.</li>
                <li>Lithium Polymer (LiPo) batteries will not be left in the models at the hanger. Participants will carry the Lithium Polymer (LiPo) batteries to their hotels, however, the same can be charged at the competition venue in the presence of the owner/ pilot/ Wingman.</li>
              </ul>
            </section>

            {/* 4. Facilities & Accommodation */}
            <section>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                <Bus size={24} /> 4. Facilities & Accommodation
              </h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Efforts are underway to provide fuel of all types to participants at the competition venue at nominal rates.</li>
                <li>A hangar facility will be provided at the venue for the safe storage of models.</li>
                <li>Complimentary buses will be available for travel between the competition venue and hotels. Additional bus services will be provided for sightseeing on <strong>23 Nov 2026</strong>.</li>
                <li>High-quality hotel accommodations will be offered to participants on a sharing basis at nominal rates.</li>
              </ul>
            </section>

            {/* 5. Prizes & Special Events */}
            <section>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                <Trophy size={24} /> 5. Prizes & Special Events
              </h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Three prizes will be awarded in each category for 1st, 2nd, and 3rd place holders.</li>
                <li>Each podium achiever will receive a certificate from the Aero Club of India. Efforts are also being made to facilitate cash prizes.</li>
                <li>Special demonstrations of air sports, including Paramotor, Hot Air Ballooning, and Skydiving, are being planned during the competition.</li>
              </ul>
            </section>

            {/* 6. Flight Operations & Liability */}
            <section>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                <Plane size={24} /> 6. Flight Operations & Liability
              </h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Any number of pilots can fly the same model in the competition, after seeking consent from the owner. In case of a crash, the organizers cannot be held liable for any compensation or relief.</li>
                <li>If the crash happens due poor skill of the pilot, the pilot will not be allowed to participate in the competition and any fee or charges paid by the participant will not be refunded.</li>
                <li>Each participant will be given 5 minutes ( time can vary depending upon number of participants) to perform the routine or task as per competition category.</li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};
