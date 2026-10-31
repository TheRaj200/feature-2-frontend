import React, { useState } from 'react';
import type { AuctionItem } from '../types/auction';
import { ArrowRight, Clock, Plus, Tag, Flame, CheckCircle2 } from 'lucide-react';

interface AuctionListProps {
  auctions: AuctionItem[];
  onSelectAuction: (id: string) => void;
  onOpenCreate: () => void;
}

export const AuctionList: React.FC<AuctionListProps> = ({
  auctions,
  onSelectAuction,
  onOpenCreate,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');

  const now = new Date().getTime();

  const filtered = auctions.filter((item) => {
    const isEnded = item.status === 'ENDED' || new Date(item.endTime).getTime() <= now;
    if (filter === 'active') return !isEnded;
    if (filter === 'ended') return isEnded;
    return true;
  });

  const getRemainingTime = (endTimeStr: string, status: string) => {
    if (status === 'ENDED') return 'Concluded';
    const diff = new Date(endTimeStr).getTime() - new Date().getTime();
    if (diff <= 0) return 'Concluded';
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m left`;
    }
    return `${minutes}m ${seconds}s left`;
  };

  const activeCount = auctions.filter(
    (a) => a.status === 'ACTIVE' && new Date(a.endTime).getTime() > now
  ).length;

  return (
    <div className="auction-list-container">
      {/* Hero Header */}
      <div className="list-hero-section">
        <div className="hero-text-wrap">
          <div className="hero-pill">
            <span className="live-dot-black" />
            <span>Live Timed Bidding in Indian Rupees (₹)</span>
          </div>
          <h2 className="list-heading">Discover & Bid on Exclusive Lots</h2>
          <p className="list-subheading">
            Transparent event auctions with verifiable bids and real-time countdowns. Click any lot to enter its bidding room or launch your own.
          </p>
        </div>

        <button onClick={onOpenCreate} className="hero-create-btn">
          <Plus size={16} />
          <span>Create New Auction</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs-row">
        <div className="tabs-group">
          <button
            onClick={() => setFilter('all')}
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
          >
            All Lots <span className="tab-count">{auctions.length}</span>
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`tab-btn ${filter === 'active' ? 'active' : ''}`}
          >
            <Flame size={13} className="tab-icon" /> Live Auctions{' '}
            <span className="tab-count">{activeCount}</span>
          </button>
          <button
            onClick={() => setFilter('ended')}
            className={`tab-btn ${filter === 'ended' ? 'active' : ''}`}
          >
            <CheckCircle2 size={13} className="tab-icon" /> Concluded{' '}
            <span className="tab-count">{auctions.length - activeCount}</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-lots-card">
          <Tag size={32} className="text-zinc-400 mb-2" />
          <h3 className="text-base font-bold text-zinc-900">No auctions found</h3>
          <p className="text-sm text-zinc-500 mb-4">
            {filter === 'active'
              ? 'There are currently no active auctions running.'
              : 'No concluded auctions yet.'}
          </p>
          <button onClick={onOpenCreate} className="btn-black-primary">
            <Plus size={15} /> Create First Auction
          </button>
        </div>
      ) : (
        <div className="lots-grid">
          {filtered.map((item) => {
            const isEnded =
              item.status === 'ENDED' || new Date(item.endTime).getTime() <= now;
            const hasBids = item.bids && item.bids.length > 0;
            const currentHighest = hasBids ? item.currentHighestBid : item.startingPrice;

            return (
              <div
                key={item._id}
                onClick={() => onSelectAuction(item._id)}
                className="lot-card animate-fade-in"
              >
                <div className="lot-image-box">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="lot-thumb"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  <div className="lot-badges-row">
                    <span className={`status-badge-modern ${isEnded ? 'ended' : 'live'}`}>
                      <span className={`status-dot-modern ${isEnded ? '' : 'pulse'}`} />
                      {isEnded ? 'CONCLUDED' : 'LIVE'}
                    </span>
                    <span className="time-badge font-mono">
                      <Clock size={11} /> {getRemainingTime(item.endTime, item.status)}
                    </span>
                  </div>
                </div>

                <div className="lot-content">
                  <h3 className="lot-title">{item.title}</h3>
                  <p className="lot-desc-snip">{item.description}</p>

                  <div className="lot-pricing-grid">
                    <div className="lot-price-col">
                      <span className="price-tag-label">Starting</span>
                      <span className="price-tag-val font-mono">
                        ₹{item.startingPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="lot-price-col text-right">
                      <span className="price-tag-label">Current Highest</span>
                      <span className="price-tag-val font-mono font-bold">
                        ₹{currentHighest.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="lot-footer">
                    <span className="lot-bids-count font-mono">
                      {item.bids ? item.bids.length : 0} {item.bids?.length === 1 ? 'bid' : 'bids'}
                      {hasBids && item.currentWinner?.bidderName && (
                        <span className="leader-pill">Leader: {item.currentWinner.bidderName}</span>
                      )}
                    </span>
                    <span className="enter-room-link">
                      View Room <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
