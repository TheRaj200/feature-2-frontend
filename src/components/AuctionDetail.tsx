import React, { useState, useEffect } from 'react';
import type { AuctionItem } from '../types/auction';
import { CountdownTimer } from './CountdownTimer';
import { WinnerBanner } from './WinnerBanner';
import { BidHistory } from './BidHistory';
import {
  ArrowLeft,
  ShieldCheck,
  IndianRupee,
  TrendingUp,
  User,
  ArrowUpRight,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

interface AuctionDetailProps {
  auction: AuctionItem;
  userName: string;
  onBack: () => void;
  onPlaceBid: (auctionId: string, bidderName: string, amount: number) => Promise<void>;
  onResetAuction: (params: { auctionId: string; durationMinutes: number; startingPrice: number }) => Promise<void>;
  bidding: boolean;
  onExpire: () => void;
}

export const AuctionDetail: React.FC<AuctionDetailProps> = ({
  auction,
  userName,
  onBack,
  onPlaceBid,
  onResetAuction,
  bidding,
  onExpire,
}) => {
  const [bidderName, setBidderName] = useState(userName || '');
  const [amount, setAmount] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Keep bidderName synced with userName
  useEffect(() => {
    if (userName) setBidderName(userName);
  }, [userName]);

  const now = new Date().getTime();
  const isAuctionEnded =
    auction.status === 'ENDED' || new Date(auction.endTime).getTime() <= now;
  const hasExistingBids = auction.bids && auction.bids.length > 0;
  const currentThreshold = hasExistingBids ? auction.currentHighestBid : auction.startingPrice;
  const minimumAcceptable = hasExistingBids ? currentThreshold + 500 : currentThreshold;

  // Set default recommended bid amount if empty
  useEffect(() => {
    if (!amount || Number(amount) <= currentThreshold) {
      const suggested = hasExistingBids ? currentThreshold + 1000 : currentThreshold;
      setAmount(String(suggested));
    }
  }, [currentThreshold, hasExistingBids]);

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
      setValidationError('Please enter a valid numeric bid amount in ₹.');
      return;
    }

    if (hasExistingBids) {
      if (numericAmount <= auction.currentHighestBid) {
        setValidationError(
          `Bid rejected: Your bid (₹${numericAmount.toLocaleString('en-IN')}) must strictly exceed current highest bid (₹${auction.currentHighestBid.toLocaleString('en-IN')}).`
        );
        return;
      }
    } else {
      if (numericAmount < auction.startingPrice) {
        setValidationError(
          `Bid rejected: Your bid cannot be lower than the starting price (₹${auction.startingPrice.toLocaleString('en-IN')}).`
        );
        return;
      }
    }

    try {
      await onPlaceBid(auction._id, trimmedName, numericAmount);
      setAmount(String(numericAmount + 1000));
    } catch (err: any) {
      setValidationError(err.message || 'Error occurred while submitting bid.');
    }
  };

  return (
    <div className="auction-detail-container">
      {/* Top Navigation */}
      <div className="detail-top-bar">
        <button onClick={onBack} className="back-link-btn">
          <ArrowLeft size={16} />
          <span>Back to All Lots</span>
        </button>

        <div className="detail-actions">
          <button
            onClick={() =>
              onResetAuction({
                auctionId: auction._id,
                durationMinutes: 5,
                startingPrice: auction.startingPrice,
              })
            }
            className="reset-pill-btn"
            title="Reset timer to 5 minutes"
          >
            <RotateCcw size={13} />
            <span>Reset Timer (5m)</span>
          </button>
        </div>
      </div>

      {/* Winner announcement if ended */}
      {isAuctionEnded && (
        <div className="mb-6">
          <WinnerBanner
            winner={auction.currentWinner}
            startingPrice={auction.startingPrice}
          />
        </div>
      )}

      {/* Main Grid */}
      <div className="detail-grid">
        {/* Left: Item Showcase */}
        <div className="detail-left-col">
          <div className="detail-image-card">
            <div className="detail-image-wrap">
              <img
                src={auction.imageUrl}
                alt={auction.title}
                className="detail-main-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="image-overlay-tag">
                <ShieldCheck size={13} />
                <span>Verified Auction Lot</span>
              </div>
            </div>

            <div className="detail-body">
              <h2 className="detail-title">{auction.title}</h2>
              <p className="detail-desc">{auction.description}</p>

              {/* Price Metrics */}
              <div className="price-metrics-grid">
                <div className="price-metric-box">
                  <span className="metric-tag-label">Starting Price</span>
                  <div className="metric-tag-val font-mono">
                    ₹{auction.startingPrice.toLocaleString('en-IN')}
                  </div>
                  <span className="metric-tag-sub">Original Reserve</span>
                </div>

                <div className="price-metric-box metric-highest">
                  <span className="metric-tag-label flex-center-gap">
                    <TrendingUp size={13} /> Current Highest Bid
                  </span>
                  <div className="metric-tag-val font-mono font-bold">
                    ₹{auction.currentHighestBid.toLocaleString('en-IN')}
                  </div>
                  <span className="metric-tag-sub">
                    {hasExistingBids && auction.currentWinner?.bidderName
                      ? `Held by ${auction.currentWinner.bidderName}`
                      : 'No bids placed yet'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Timer, Bid Form, History */}
        <div className="detail-right-col">
          <CountdownTimer
            startTime={auction.startTime}
            endTime={auction.endTime}
            status={isAuctionEnded ? 'ENDED' : 'ACTIVE'}
            onExpire={onExpire}
          />

          {/* Place Bid Card */}
          <div className="bid-form-card">
            <div className="bid-form-header">
              <h3 className="bid-form-title">Place Your Bid</h3>
              <span className="min-bid-badge">
                Min: <strong className="font-mono">₹{minimumAcceptable.toLocaleString('en-IN')}</strong>
              </span>
            </div>

            {validationError && (
              <div className="validation-alert">
                <AlertCircle size={15} className="shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {isAuctionEnded ? (
              <div className="ended-notice-box">
                <p className="notice-title">Auction Concluded</p>
                <p className="notice-text">
                  This lot has officially ended. Winner:{' '}
                  <strong>{auction.currentWinner?.bidderName || 'No bids'}</strong>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bid-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="bidder-name-input">
                    <User size={13} /> Participant Name
                  </label>
                  <input
                    id="bidder-name-input"
                    type="text"
                    value={bidderName}
                    onChange={(e) => {
                      setBidderName(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="Enter your name"
                    className="form-input"
                    disabled={bidding}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="bid-amount-input">
                    <IndianRupee size={13} /> Your Bid Amount (₹)
                  </label>
                  <div className="input-currency-wrapper">
                    <span className="currency-symbol">₹</span>
                    <input
                      id="bid-amount-input"
                      type="number"
                      step={100}
                      min={minimumAcceptable}
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setValidationError(null);
                      }}
                      className="form-input currency-input font-mono"
                      disabled={bidding}
                      required
                    />
                  </div>
                </div>

                {/* Quick Add */}
                <div className="quick-bid-section">
                  <span className="quick-bid-label">Quick Add:</span>
                  <div className="quick-btn-group">
                    {[500, 1000, 2500, 5000].map((increment) => (
                      <button
                        type="button"
                        key={increment}
                        onClick={() => handleQuickAdd(increment)}
                        className="quick-btn"
                        disabled={bidding}
                      >
                        +₹{increment.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bidding}
                  className="btn-black-primary w-full"
                >
                  {bidding ? (
                    'Submitting Bid...'
                  ) : (
                    <span className="flex-center-gap">
                      Confirm & Place Bid <ArrowUpRight size={16} />
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Bid History */}
          <BidHistory
            bids={auction.bids}
            currentHighestBid={auction.currentHighestBid}
          />
        </div>
      </div>
    </div>
  );
};
