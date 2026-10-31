import React from 'react';
import type { AuctionItem } from '../types/auction';
import { Tag, TrendingUp, ShieldCheck, UserCheck } from 'lucide-react';
import { formatINR } from '../utils/format';

interface ItemCardProps {
  auction: AuctionItem;
}

export const ItemCard: React.FC<ItemCardProps> = ({ auction }) => {
  const hasBids = auction.bids && auction.bids.length > 0;

  return (
    <div className="item-card">
      <div className="item-image-wrapper">
        <img
          src={auction.imageUrl}
          alt={auction.title}
          className="item-image"
          onError={(e) => {
            // Fallback gracefully if image fails to load
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="image-overlay-badge">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Verified Event Lot #01</span>
        </div>
      </div>

      <div className="item-body">
        <div className="item-title-row">
          <h2 className="item-title">{auction.title}</h2>
        </div>

        <p className="item-description">{auction.description}</p>

        <div className="price-metrics-container">
          {/* Starting Price Box */}
          <div className="metric-box starting-box">
            <span className="metric-label">
              <Tag size={13} /> Starting Price
            </span>
            <div className="metric-value font-mono">
              ₹{formatINR(auction?.startingPrice)}
            </div>
            <span className="metric-subtext">Original Reserve</span>
          </div>

          {/* Current Highest Bid Box */}
          <div className="metric-box highest-box">
            <span className="metric-label font-semibold text-emerald-700">
              <TrendingUp size={14} /> Current Highest Bid
            </span>
            <div className="metric-value font-mono text-emerald-600 font-bold">
              ₹{formatINR(auction?.currentHighestBid)}
            </div>
            <span className="metric-subtext">
              {hasBids && auction.currentWinner?.bidderName ? (
                <span className="flex-center-gap">
                  <UserCheck size={12} /> Held by {auction.currentWinner.bidderName}
                </span>
              ) : (
                'No bids placed yet — Starting at reserve'
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
