import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { AuctionItem } from './types/auction';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { WelcomeModal } from './components/WelcomeModal';
import { AuctionList } from './components/AuctionList';
import { AuctionDetail } from './components/AuctionDetail';
import { CreateAuctionModal } from './components/CreateAuctionModal';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import './App.css';

export const App: React.FC = () => {
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('eventbid_username') || '';
  });
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(() => {
    return !localStorage.getItem('eventbid_username');
  });

  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'detail'>('list');

  const [loading, setLoading] = useState<boolean>(true);
  const [bidding, setBidding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const previousWinnerRef = useRef<Record<string, string | null>>({});

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

  const fetchAuctions = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const list = await api.getAllAuctions();
      setAuctions(list);
      setError(null);

      // Notification check if any selected auction got a new bid
      list.forEach((item) => {
        const prevWinner = previousWinnerRef.current[item._id];
        if (
          item.currentWinner?.bidderName &&
          prevWinner &&
          item.currentWinner.bidderName !== prevWinner
        ) {
          addToast(
            'success',
            `New high bid on "${item.title}": ₹${item.currentHighestBid.toLocaleString('en-IN')} by ${item.currentWinner.bidderName}!`
          );
        }
        previousWinnerRef.current[item._id] = item.currentWinner?.bidderName || null;
      });
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
    fetchAuctions(true);
    const interval = setInterval(() => {
      fetchAuctions(false);
    }, 2500);
    return () => clearInterval(interval);
  }, [fetchAuctions]);

  const handleSaveName = (name: string) => {
    setUserName(name);
    localStorage.setItem('eventbid_username', name);
    setIsWelcomeOpen(false);
    addToast('success', `Welcome, ${name}! You can now bid and launch auctions.`);
  };

  const handleSelectAuction = (id: string) => {
    setSelectedId(id);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedId(null);
  };

  const handleCreateAuction = async (params: {
    title: string;
    description: string;
    startingPrice: number;
    durationMinutes: number;
    imageUrl: string;
  }) => {
    try {
      const created = await api.createAuction({
        ...params,
        creatorName: userName || 'Organizer',
      });
      setAuctions((prev) => [created, ...prev]);
      setSelectedId(created._id);
      setView('detail');
      addToast('success', `Auction lot "${created.title}" launched successfully!`);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to create auction');
      throw err;
    }
  };

  const handlePlaceBid = async (auctionId: string, bidderName: string, amount: number) => {
    setBidding(true);
    try {
      const updated = await api.placeBid(auctionId, bidderName, amount);
      setAuctions((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      previousWinnerRef.current[auctionId] = bidderName;
      addToast(
        'success',
        `Bid accepted! ₹${amount.toLocaleString('en-IN')} is now the highest bid.`
      );
    } catch (err: any) {
      addToast('error', err.message || 'Bid rejected');
      throw err;
    } finally {
      setBidding(false);
    }
  };

  const handleResetAuction = async (params: {
    auctionId: string;
    durationMinutes: number;
    startingPrice: number;
  }) => {
    try {
      const resetData = await api.resetAuction(params);
      setAuctions((prev) => prev.map((item) => (item._id === resetData._id ? resetData : item)));
      previousWinnerRef.current[params.auctionId] = null;
      addToast('success', 'Auction timer reset to 5 minutes!');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to reset auction');
      throw err;
    }
  };

  const selectedAuction = auctions.find((a) => a._id === selectedId) || auctions[0];

  if (loading && auctions.length === 0) {
    return (
      <div className="center-screen">
        <div className="loading-card-bw">
          <Loader2 size={32} className="spin text-black mb-3" />
          <p className="loading-text-bw">Connecting to EventBid Live Network...</p>
        </div>
      </div>
    );
  }

  if (error && auctions.length === 0) {
    return (
      <div className="center-screen">
        <div className="error-card-bw">
          <AlertCircle size={36} className="text-black mb-3" />
          <h2 className="text-lg font-bold text-black">Network Connection Issue</h2>
          <p className="text-sm text-zinc-600 mt-1 mb-4">
            {error || 'Unable to connect to backend server.'}
          </p>
          <button onClick={() => fetchAuctions(true)} className="btn-black-primary">
            <RefreshCw size={14} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout-bw">
      <Navbar
        currentView={view}
        userName={userName}
        onBackToList={handleBackToList}
        onOpenCreate={() => setIsCreateOpen(true)}
        onChangeName={() => setIsWelcomeOpen(true)}
      />

      <main className="main-content-bw">
        <div className="content-container-bw">
          {view === 'list' || !selectedAuction ? (
            <AuctionList
              auctions={auctions}
              onSelectAuction={handleSelectAuction}
              onOpenCreate={() => setIsCreateOpen(true)}
            />
          ) : (
            <AuctionDetail
              auction={selectedAuction}
              userName={userName}
              onBack={handleBackToList}
              onPlaceBid={handlePlaceBid}
              onResetAuction={handleResetAuction}
              bidding={bidding}
              onExpire={() => fetchAuctions(false)}
            />
          )}
        </div>
      </main>

      <WelcomeModal
        isOpen={isWelcomeOpen}
        onSaveName={handleSaveName}
        initialName={userName}
      />

      <CreateAuctionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateAuction}
      />

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;
