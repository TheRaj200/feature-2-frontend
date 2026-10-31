import React, { useEffect, useRef } from 'react';
import type { Winner } from '../types/auction';
import { Trophy, Frown, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatINR } from '../utils/format';

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
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#09090b', '#71717a', '#a1a1aa', '#ffffff'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [winner]);

  const hasWinner = Boolean(winner?.bidderName && winner.bidAmount > 0);

  return (
    <div className={`winner-card-bw ${hasWinner ? 'has-winner' : 'no-winner'}`}>
      <div className="winner-icon-box">
        {hasWinner ? (
          <Trophy size={26} className="text-black" />
        ) : (
          <Frown size={26} className="text-zinc-400" />
        )}
      </div>

      <div className="winner-details">
        <div className="winner-tag">
          {hasWinner ? (
            <span className="flex-center-gap">
              <Sparkles size={12} /> OFFICIAL WINNER DECLARED
            </span>
          ) : (
            <span>AUCTION CONCLUDED</span>
          )}
        </div>

        {hasWinner ? (
          <>
            <h3 className="winner-name-text">{winner?.bidderName}</h3>
            <p className="winner-sub-text">
              Won this lot with the highest verified bid of{' '}
              <strong className="font-mono text-black font-bold">
                ₹{formatINR(winner?.bidAmount)}
              </strong>
            </p>
          </>
        ) : (
          <>
            <h3 className="winner-name-text text-zinc-500">No Bids Placed</h3>
            <p className="winner-sub-text">
              Lot concluded with zero bids above reserve of ₹{formatINR(startingPrice)}.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
