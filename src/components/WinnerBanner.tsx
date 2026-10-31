import React, { useEffect, useRef } from 'react';
import type { Winner } from '../types/auction';
import { Trophy, Frown, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WinnerBannerProps {
  winner: Winner | null;
  startingPrice: number;
}

export const WinnerBanner: React.FC<WinnerBannerProps> = ({ winner, startingPrice }) => {
  const confettiTriggered = useRef(false);

  useEffect(() => {
    if (winner?.bidderName && !confettiTriggered.current) {
      confettiTriggered.current = true;
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch (e) {
        // Safe fallback if canvas not available
      }
    }
  }, [winner]);

  const hasWinner = Boolean(winner?.bidderName && winner.bidAmount > 0);

  return (
    <div className={`winner-card ${hasWinner ? 'has-winner' : 'no-winner'}`}>
      <div className="winner-icon-circle">
        {hasWinner ? (
          <Trophy size={32} className="trophy-icon" />
        ) : (
          <Frown size={32} className="text-slate-400" />
        )}
      </div>

      <div className="winner-details">
        <div className="winner-headline-badge">
          {hasWinner ? (
            <span className="flex-center-gap">
              <Sparkles size={13} /> OFFICIAL WINNER DECLARED
            </span>
          ) : (
            <span>AUCTION CONCLUDED</span>
          )}
        </div>

        {hasWinner ? (
          <>
            <h3 className="winner-name">{winner?.bidderName}</h3>
            <p className="winner-meta">
              Secured the item with a winning bid of{' '}
              <strong className="font-mono text-emerald-600 font-bold">
                ${winner?.bidAmount.toLocaleString()}
              </strong>
            </p>
          </>
        ) : (
          <>
            <h3 className="winner-name text-slate-600">No Bids Placed</h3>
            <p className="winner-meta">
              The auction expired with zero bids above the reserve of ${startingPrice.toLocaleString()}.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
