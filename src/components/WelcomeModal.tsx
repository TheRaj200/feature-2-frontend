import React, { useState } from 'react';
import { User, ArrowRight, ShieldCheck } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onSaveName: (name: string) => void;
  initialName?: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onSaveName,
  initialName = '',
}) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name to proceed.');
      return;
    }
    onSaveName(trimmed);
  };

  return (
    <div className="modal-backdrop">
      <div className="welcome-card animate-fade-in">
        <div className="welcome-icon-box">
          <ShieldCheck size={28} className="text-black" />
        </div>

        <h2 className="welcome-title">Welcome to EventBid</h2>
        <p className="welcome-subtitle">
          Transparent, real-time timed auctions in Indian Rupees (₹). Enter your name to explore live lots, place competitive bids, or create your own auction.
        </p>

        <form onSubmit={handleSubmit} className="welcome-form">
          <div className="form-group">
            <label className="form-label" htmlFor="participant-name">
              <User size={13} /> Participant Name
            </label>
            <input
              id="participant-name"
              type="text"
              autoFocus
              placeholder="e.g. Raj Sharma, Ananya..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              className="form-input welcome-input"
              maxLength={40}
              required
            />
            {error && <span className="error-text">{error}</span>}
          </div>

          <button type="submit" className="enter-btn">
            <span>Enter Auction Floor</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
