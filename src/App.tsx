import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { AuctionItem } from './types/auction';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { CountdownTimer } from './components/CountdownTimer';
import { ItemCard } from './components/ItemCard';
import { BidForm } from './components/BidForm';
import { WinnerBanner } from './components/WinnerBanner';
import { BidHistory } from './components/BidHistory';
import { OrganizerModal } from './components/OrganizerModal';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import './App.css';

export const App: React.FC = () => {
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bidding, setBidding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const previousWinnerRef = useRef<string | null>(null);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchAuction = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await api.getAuction();
      setAuction(data);
      setError(null);

      // Notify if new highest bid was placed by someone else
      if (data.currentWinner?.bidderName && previousWinnerRef.current) {
        if (data.currentWinner.bidderName !== previousWinnerRef.current) {
          addToast('success', `New leading bid: $${data.currentHighestBid} by ${data.currentWinner.bidderName}!`);
        }
      }
      previousWinnerRef.current = data.currentWinner?.bidderName || null;
    } catch (err: any) {
      console.error(err);
      if (isInitial) {
        setError(err.message || 'Could not connect to auction server.');
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuction(true);
    // Real-time synchronization polling every 2.5 seconds
    const interval = setInterval(() => {
      fetchAuction(false);
    }, 2500);
    return () => clearInterval(interval);
  }, [fetchAuction]);

  const handlePlaceBid = async (bidderName: string, amount: number) => {
    if (!auction) return;
    setBidding(true);
    try {
      const updated = await api.placeBid(auction._id, bidderName, amount);
      setAuction(updated);
      previousWinnerRef.current = bidderName;
      addToast('success', `Success! Your bid of $${amount.toLocaleString()} is now the highest bid.`);
    } catch (err: any) {
      addToast('error', err.message || 'Bid rejected');
      throw err;
    } finally {
      setBidding(false);
    }
  };

  const handleAuctionExpire = () => {
    fetchAuction(false);
  };

  const handleResetAuction = async (params: {
    durationMinutes: number;
    startingPrice: number;
    title?: string;
  }) => {
    try {
      const resetData = await api.resetAuction(params);
      setAuction(resetData);
      previousWinnerRef.current = null;
      addToast('success', 'Auction has been restarted with a fresh timer.');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to restart auction');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="center-screen">
        <div className="loading-card">
          <Loader2 size={36} className="spin text-indigo-600" />
          <p className="loading-text">Connecting to Live Auction Server...</p>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="center-screen">
        <div className="error-card">
          <AlertCircle size={40} className="text-red-500 mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Connection Failed</h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            {error || 'Unable to load auction item. Please ensure backend server is running.'}
          </p>
          <button onClick={() => fetchAuction(true)} className="confirm-btn">
            <RefreshCw size={14} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const isEnded = auction.status === 'ENDED' || new Date(auction.endTime) <= new Date();

  return (
    <div className="app-layout">
      <Navbar
        status={isEnded ? 'ENDED' : 'ACTIVE'}
        onOpenSettings={() => setIsOrganizerOpen(true)}
      />

      <main className="main-content">
        <div className="content-container">
          {/* Top Banner / Winner announcement if ended */}
          {isEnded && (
            <div className="winner-section mb-6">
              <WinnerBanner
                winner={auction.currentWinner}
                startingPrice={auction.startingPrice}
              />
            </div>
          )}

          <div className="auction-grid">
            {/* Left Column: Item Display */}
            <div className="left-column">
              <ItemCard auction={auction} />
            </div>

            {/* Right Column: Timer, Bidding Form, and Live History */}
            <div className="right-column">
              <CountdownTimer
                startTime={auction.startTime}
                endTime={auction.endTime}
                status={isEnded ? 'ENDED' : 'ACTIVE'}
                onExpire={handleAuctionExpire}
              />

              <BidForm
                auction={auction}
                onPlaceBid={handlePlaceBid}
                loading={bidding}
              />

              <BidHistory
                bids={auction.bids}
                currentHighestBid={auction.currentHighestBid}
              />
            </div>
          </div>
        </div>
      </main>

      <OrganizerModal
        isOpen={isOrganizerOpen}
        onClose={() => setIsOrganizerOpen(false)}
        onReset={handleResetAuction}
        currentTitle={auction.title}
        currentStartingPrice={auction.startingPrice}
      />

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;
