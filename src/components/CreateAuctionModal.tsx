import React, { useState } from 'react';
import { X, Plus, IndianRupee, Clock, Image, FileText } from 'lucide-react';

interface CreateAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (params: {
    title: string;
    description: string;
    startingPrice: number;
    durationMinutes: number;
    imageUrl: string;
  }) => Promise<void>;
}

const PRESET_IMAGES = [
  {
    name: 'Vintage Guitar',
    url: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Luxury Watch',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Classic Camera',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Smart Watch',
    url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Sneaker Lot',
    url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80',
  },
];

export const CreateAuctionModal: React.FC<CreateAuctionModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState<number | string>(15000);
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please provide an item title.');
      return;
    }

    const price = Number(startingPrice);
    if (isNaN(price) || price < 1) {
      setError('Please enter a valid starting price in ₹.');
      return;
    }

    setLoading(true);
    try {
      await onCreate({
        title: trimmedTitle,
        description: description.trim() || 'Exclusive lot with transparent live bidding.',
        startingPrice: price,
        durationMinutes: Number(durationMinutes),
        imageUrl: imageUrl.trim() || PRESET_IMAGES[0].url,
      });
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setStartingPrice(15000);
      setDurationMinutes(5);
    } catch (err: any) {
      setError(err.message || 'Failed to create auction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Plus size={18} />
            <h3 className="modal-title">Create New Auction Lot</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn" type="button">
            <X size={18} />
          </button>
        </div>

        <p className="modal-description">
          Set up a timed auction for your item with transparent real-time bidding in Indian Rupees (₹).
        </p>

        {error && <div className="validation-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="create-title">
              <FileText size={13} /> Item Title
            </label>
            <input
              id="create-title"
              type="text"
              placeholder="e.g. Apple iPad Pro 11-inch M4 (Sealed)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="create-desc">
              Description
            </label>
            <textarea
              id="create-desc"
              rows={2}
              placeholder="Provide key details, condition, and verification info..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input form-textarea"
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="create-price">
                <IndianRupee size={13} /> Starting Price (₹)
              </label>
              <input
                id="create-price"
                type="number"
                min={1}
                step={500}
                placeholder="15000"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                className="form-input font-mono"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="create-duration">
                <Clock size={13} /> Duration
              </label>
              <select
                id="create-duration"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="form-select"
              >
                <option value={1}>1 Minute (Speed Run)</option>
                <option value={2}>2 Minutes (Fast Test)</option>
                <option value={5}>5 Minutes (Recommended)</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>
          </div>

          {/* Preset Images */}
          <div className="form-group">
            <label className="form-label">
              <Image size={13} /> Choose Image Preview
            </label>
            <div className="preset-images-row">
              {PRESET_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => setImageUrl(preset.url)}
                  className={`preset-btn ${imageUrl === preset.url ? 'active' : ''}`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <input
              type="url"
              placeholder="Or paste custom image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="form-input custom-url-input mt-2"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-black-primary">
              {loading ? 'Creating Auction...' : 'Launch Auction Lot ➔'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
