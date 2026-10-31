import React, { useState, useEffect } from 'react';
import type { AuctionItem } from '../types/auction';
import { ArrowUpRight, DollarSign, User, AlertCircle } from 'lucide-react';

interface BidFormProps {
  auction: AuctionItem;
  onPlaceBid: (bidderName: string, amount: number) => Promise<void>;
  loading: boolean;
}

export const BidForm: React.FC<BidFormProps> = ({ auction, onPlaceBid, loading }) => {
  const [bidderName, setBidderName] = useState(() => {
    return localStorage.getItem('last_bidder_name') || '';
  });
  const [amount, setAmount] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const isAuctionEnded = auction.status === 'ENDED' || new Date(auction.endTime) <= new Date();
  const hasExistingBids = auction.bids && auction.bids.length > 0;
  const currentThreshold = hasExistingBids ? auction.currentHighestBid : auction.startingPrice;
  const minimumAcceptable = hasExistingBids ? currentThreshold + 1 : currentThreshold;

  // Set default recommended bid amount if empty
  useEffect(() => {
    if (!amount || Number(amount) <= currentThreshold) {
      const suggested = hasExistingBids ? currentThreshold + 25 : currentThreshold;
      setAmount(String(suggested));
    }
  }, [currentThreshold, hasExistingBids]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBidderName(e.target.value);
    setValidationError(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setValidationError(null);
  };

  const handleQuickAdd = (increment: number) => {
    if (isAuctionEnded) return;
    const base = hasExistingBids ? auction.currentHighestBid : auction.startingPrice;
    const newAmount = base + increment;
    setAmount(String(newAmount));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (isAuctionEnded) {
      setValidationError('Auction has ended. Bidding is permanently closed.');
      return;
    }

    const trimmedName = bidderName.trim();
    if (!trimmedName) {
      setValidationError('Please enter your participant name to place a bid.');
      return;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setValidationError('Please enter a valid positive numeric bid amount.');
      return;
    }

    if (hasExistingBids) {
      if (numericAmount <= auction.currentHighestBid) {
        setValidationError(
          `Bid rejected: Your bid ($${numericAmount}) must strictly exceed the highest bid ($${auction.currentHighestBid}).`
        );
        return;
      }
    } else {
      if (numericAmount < auction.startingPrice) {
        setValidationError(
          `Bid rejected: Your bid cannot be lower than the starting price ($${auction.startingPrice}).`
        );
        return;
      }
    }

    // Save name for convenience
    localStorage.setItem('last_bidder_name', trimmedName);

    try {
      await onPlaceBid(trimmedName, numericAmount);
      // Success feedback: automatically update input to next step
      setAmount(String(numericAmount + 25));
    } catch (err: any) {
      setValidationError(err.message || 'Error occurred while submitting bid.');
    }
  };

  return (
    <div className="bid-form-card">
      <div className="bid-form-header">
        <h3 className="bid-form-title">Place Your Bid</h3>
        <span className="min-bid-badge">
          Min acceptable: <strong className="font-mono">${minimumAcceptable.toLocaleString()}</strong>
        </span>
      </div>

      {validationError && (
        <div className="validation-alert">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {isAuctionEnded ? (
        <div className="ended-notice-box">
          <p className="notice-title">Auction Concluded</p>
          <p className="notice-text">
            This timed auction has officially finished. Bids are no longer accepted.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bid-form">
          <div className="form-group">
            <label className="form-label" htmlFor="bidderName">
              <User size={14} /> Participant Name
            </label>
            <input
              id="bidderName"
              type="text"
              placeholder="e.g. Maya Sharma, Alex Vance..."
              value={bidderName}
              onChange={handleNameChange}
              disabled={loading || isAuctionEnded}
              className="form-input"
              maxLength={40}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="bidAmount">
              <DollarSign size={14} /> Your Bid Amount (USD)
            </label>
            <div className="input-currency-wrapper">
              <span className="currency-symbol">$</span>
              <input
                id="bidAmount"
                type="number"
                step="1"
                min={minimumAcceptable}
                placeholder={String(minimumAcceptable)}
                value={amount}
                onChange={handleAmountChange}
                disabled={loading || isAuctionEnded}
                className="form-input currency-input font-mono"
                required
              />
            </div>
          </div>

          {/* Quick Increment Buttons */}
          <div className="quick-bid-section">
            <span className="quick-bid-label">Quick Add:</span>
            <div className="quick-btn-group">
              {[10, 25, 50, 100].map((increment) => (
                <button
                  type="button"
                  key={increment}
                  onClick={() => handleQuickAdd(increment)}
                  disabled={loading || isAuctionEnded}
                  className="quick-btn"
                >
                  +${increment}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isAuctionEnded}
            className={`submit-bid-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <span className="flex-center-gap">Submitting Bid...</span>
            ) : (
              <span className="flex-center-gap">
                Confirm & Place Bid <ArrowUpRight size={18} />
              </span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
