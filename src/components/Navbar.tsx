import React from 'react';
import { Gavel, Settings } from 'lucide-react';

interface NavbarProps {
  status: 'ACTIVE' | 'ENDED';
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ status, onOpenSettings }) => {
  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <div className="logo-group">
          <div className="logo-icon-box">
            <Gavel className="w-5 h-5 text-indigo-600" size={22} color="#4f46e5" />
          </div>
          <div>
            <h1 className="brand-title">EventBid</h1>
            <p className="brand-subtitle">Transparent Live Auction System</p>
          </div>
        </div>

        <div className="nav-actions">
          <div className={`status-pill ${status === 'ACTIVE' ? 'active' : 'ended'}`}>
            <span className={`status-dot ${status === 'ACTIVE' ? 'pulse' : ''}`} />
            <span className="status-text">{status === 'ACTIVE' ? 'LIVE AUCTION' : 'AUCTION CONCLUDED'}</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="organizer-btn"
            title="Organizer Controls & Reset"
          >
            <Settings size={18} />
            <span className="btn-label">Organizer Controls</span>
          </button>
        </div>
      </div>
    </header>
  );
};
