import React from 'react';
import { Gavel, Plus, User, ArrowLeft } from 'lucide-react';

interface NavbarProps {
  currentView: 'list' | 'detail';
  userName: string;
  onBackToList: () => void;
  onOpenCreate: () => void;
  onChangeName: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  userName,
  onBackToList,
  onOpenCreate,
  onChangeName,
}) => {
  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <div className="nav-left">
          {currentView === 'detail' ? (
            <button onClick={onBackToList} className="back-nav-btn">
              <ArrowLeft size={16} />
              <span>All Auctions</span>
            </button>
          ) : (
            <div className="brand-wrap">
              <div className="brand-icon-box">
                <Gavel size={18} className="text-white" />
              </div>
              <div>
                <h1 className="brand-title">EventBid</h1>
                <p className="brand-subtitle">Live Monochromatic Auctions</p>
              </div>
            </div>
          )}
        </div>

        <div className="nav-right">
          {userName && (
            <button
              onClick={onChangeName}
              className="user-profile-badge"
              title="Click to change your name"
            >
              <div className="avatar-dot">
                <User size={12} />
              </div>
              <span className="user-name-text">
                <span className="user-dim-text">User:</span> {userName}
              </span>
            </button>
          )}

          <button onClick={onOpenCreate} className="create-auction-nav-btn">
            <Plus size={15} />
            <span>Create Auction</span>
          </button>
        </div>
      </div>
    </header>
  );
};
