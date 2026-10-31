import React from 'react';
import type { Bid } from '../types/auction';
import { History, Crown, User, Clock } from 'lucide-react';

interface BidHistoryProps {
  bids: Bid[];
  currentHighestBid: number;
}

export const BidHistory: React.FC<BidHistoryProps> = ({ bids, currentHighestBid }) => {
  // Bids sorted newest first
  const sortedBids = [...bids].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bid-history-card">
      <div className="history-header">
        <div className="flex-center-gap">
          <History size={18} className="text-indigo-600" />
          <h3 className="history-title">Bid Activity History</h3>
        </div>
        <span className="history-count-badge font-mono">
          {bids.length} {bids.length === 1 ? 'Bid' : 'Bids'}
        </span>
      </div>

      {sortedBids.length === 0 ? (
        <div className="empty-history-state">
          <div className="empty-icon-wrap">
            <History size={24} className="text-slate-300" />
          </div>
          <p className="empty-title">No bids placed yet</p>
          <p className="empty-subtext">Be the first participant to place a transparent bid!</p>
        </div>
      ) : (
        <div className="history-list-wrapper">
          <div className="history-list">
            {sortedBids.map((bid, index) => {
              const isHighest = bid.amount === currentHighestBid;
              return (
                <div
                  key={bid._id || `${bid.bidderName}-${bid.amount}-${index}`}
                  className={`history-item ${isHighest ? 'highlight-leader' : ''} animate-fade-in`}
                >
                  <div className="bidder-info">
                    <div className={`bidder-avatar ${isHighest ? 'avatar-leader' : ''}`}>
                      {isHighest ? <Crown size={14} /> : <User size={14} />}
                    </div>
                    <div>
                      <div className="bidder-name-row">
                        <span className="bidder-name">{bid.bidderName}</span>
                        {isHighest && <span className="leader-badge">Current Leader</span>}
                      </div>
                      <span className="bid-time flex-center-gap">
                        <Clock size={11} /> {formatTime(bid.timestamp)}
                      </span>
                    </div>
                  </div>

                  <div className="bid-amount-tag font-mono">
                    ${bid.amount.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
