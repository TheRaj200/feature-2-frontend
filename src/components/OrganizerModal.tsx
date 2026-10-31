import React, { useState } from 'react';
import { X, RefreshCw, Clock, DollarSign, RotateCcw } from 'lucide-react';

interface OrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: (params: { durationMinutes: number; startingPrice: number; title?: string }) => Promise<void>;
  currentTitle: string;
  currentStartingPrice: number;
}

export const OrganizerModal: React.FC<OrganizerModalProps> = ({
  isOpen,
  onClose,
  onReset,
  currentTitle,
  currentStartingPrice,
}) => {
  const [durationMinutes, setDurationMinutes] = useState<number>(3);
  const [startingPrice, setStartingPrice] = useState<number>(currentStartingPrice || 500);
  const [title, setTitle] = useState<string>(currentTitle || '');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onReset({
        durationMinutes: Number(durationMinutes),
        startingPrice: Number(startingPrice),
        title: title.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-center-gap">
            <RotateCcw size={18} className="text-indigo-600" />
            <h3 className="modal-title">Organizer Control Panel</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <p className="modal-description">
          Restart the timed auction with fresh countdown parameters to test the full lifecycle, bid verification, and winner declaration.
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Item Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder="Signed Vintage 1965 Fender Stratocaster"
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                <Clock size={13} /> Timer Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="form-select"
              >
                <option value={1}>1 Minute (Fast Test)</option>
                <option value={2}>2 Minutes (Recommended)</option>
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <DollarSign size={13} /> Starting Reserve ($)
              </label>
              <input
                type="number"
                min={1}
                value={startingPrice}
                onChange={(e) => setStartingPrice(Number(e.target.value))}
                className="form-input font-mono"
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="confirm-btn">
              {loading ? (
                <span className="flex-center-gap">
                  <RefreshCw size={14} className="spin" /> Resetting...
                </span>
              ) : (
                <span className="flex-center-gap">
                  <RotateCcw size={14} /> Restart Auction Now
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
