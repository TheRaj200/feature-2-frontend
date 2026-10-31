import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  startTime: string;
  endTime: string;
  status: 'ACTIVE' | 'ENDED';
  onExpire: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  startTime,
  endTime,
  status,
  onExpire,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  }>({ hours: 0, minutes: 0, seconds: 0, totalMs: 0 });

  const [progressPercent, setProgressPercent] = useState<number>(100);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const start = new Date(startTime).getTime();
      const difference = end - now;

      if (difference <= 0 || status === 'ENDED') {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        setProgressPercent(0);
        if (status === 'ACTIVE') {
          onExpire();
        }
        return;
      }

      const totalDuration = end - start;
      const remainingRatio = totalDuration > 0 ? (difference / totalDuration) * 100 : 0;
      setProgressPercent(Math.max(0, Math.min(100, remainingRatio)));

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, totalMs: difference });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [endTime, startTime, status, onExpire]);

  const isEndingSoon = status === 'ACTIVE' && timeLeft.totalMs > 0 && timeLeft.totalMs < 60000;

  return (
    <div className={`countdown-card ${isEndingSoon ? 'warning-bg' : ''}`}>
      <div className="countdown-header">
        <div className="countdown-title-wrap">
          <Clock size={18} className={isEndingSoon ? 'text-amber-500' : 'text-indigo-600'} />
          <span className="countdown-title">
            {status === 'ENDED' || timeLeft.totalMs <= 0
              ? 'Auction Finalized'
              : isEndingSoon
              ? 'Ending Very Soon!'
              : 'Time Remaining'}
          </span>
        </div>
        <div className="countdown-badge">
          {status === 'ACTIVE' && timeLeft.totalMs > 0 ? (
            <span className="live-tag">Accepting Bids</span>
          ) : (
            <span className="closed-tag">Bidding Closed</span>
          )}
        </div>
      </div>

      <div className="countdown-digits-grid">
        <div className="digit-box">
          <span className="digit-value">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="digit-label">HOURS</span>
        </div>
        <span className="digit-colon">:</span>
        <div className="digit-box">
          <span className="digit-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="digit-label">MINS</span>
        </div>
        <span className="digit-colon">:</span>
        <div className="digit-box">
          <span className={`digit-value ${isEndingSoon ? 'digit-urgent' : ''}`}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="digit-label">SECS</span>
        </div>
      </div>

      {/* Visual progress bar */}
      <div className="progress-track">
        <div
          className={`progress-fill ${isEndingSoon ? 'progress-warning' : ''}`}
          style={{ width: `${status === 'ENDED' ? 0 : progressPercent}%` }}
        />
      </div>
    </div>
  );
};
