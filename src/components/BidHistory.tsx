import React from 'react';
import type { Bid } from '../types/auction';
import { History, Crown, User, Clock } from 'lucide-react';
import { formatINR } from '../utils/format';

interface BidHistoryProps {
  bids: Bid[];
  currentHighestBid: number;
}

export const BidHistory: React.FC<BidHistoryProps> = ({ bids, currentHighestBid }) => {
  const sortedBids = [...bids].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="bid-history-card">
      <div className="history-header">
        <div className="flex-center-gap">
          <History size={16} />
          <h3 className="history-title">Bid Activity History</h3>
        </div>
        <span className="history-count-badge font-mono">
          {bids.length} {bids.length === 1 ? 'Bid' : 'Bids'}
        </span>
      </div>

      {sortedBids.length === 0 ? (
        <div className="empty-history-state">
          <p className="empty-title">No bids placed yet</p>
          <p className="empty-subtext">Be the first to place a transparent bid on this lot!</p>
        </div>
      ) : (
        <div className="history-list-wrapper">
          <div className="history-list">
            {sortedBids.map((bid, index) => {
              const isHighest = bid.amount === currentHighestBid;
              return (
                <div
                  key={bid._id || `${bid.bidderName}-${bid.amount}-${index}`}
                  className={`history-item-bw ${isHighest ? 'is-leader' : ''} animate-fade-in`}
                >
                  <div className="bidder-info">
                    <div className={`bidder-avatar-bw ${isHighest ? 'avatar-leader-bw' : ''}`}>
                      {isHighest ? <Crown size={12} /> : <User size={12} />}
                    </div>
                    <div>
                      <div className="bidder-name-row">
                        <span className="bidder-name">{bid.bidderName}</span>
                        {isHighest && <span className="leader-badge-bw">Current Leader</span>}
                      </div>
                      <span className="bid-time flex-center-gap">
                        <Clock size={10} /> {formatTime(bid.timestamp)}
                      </span>
                    </div>
                  </div>

                  <div className="bid-amount-tag font-mono">
                    ₹{formatINR(bid.amount)}
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
