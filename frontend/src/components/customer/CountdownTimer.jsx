import React, { useState, useEffect } from 'react';

/**
 * Dynamic Flash Deal Countdown Timer (Exact Meesho Pattern)
 * 
 * - Shows countdown in format: ⏳ 03h : 51m : 28s
 * - Uses real-time epoch so timers do not reset arbitrarily on browser refresh.
 * - Auto-expires: When timer reaches 00h : 00m : 00s, it automatically hides (returns null),
 *   returning the product card to its clean normal state.
 */
export default function CountdownTimer({ 
  productId,
  initialHours = 4, 
  initialMinutes = 31, 
  initialSeconds = 22, 
  className = '',
  onExpire
}) {
  const calculateRemainingSeconds = () => {
    const now = Date.now();
    const fourHoursMs = 4 * 60 * 60 * 1000;
    
    // Stable per-product hash so each product has its own consistent deadline
    let offset = 0;
    if (productId) {
      let hash = 0;
      for (let i = 0; i < productId.length; i++) {
        hash = (hash << 5) - hash + productId.charCodeAt(i);
        hash |= 0;
      }
      offset = Math.abs(hash) % (90 * 60 * 1000); // up to 90 min variation
    }

    const currentEpochBlock = Math.floor(now / fourHoursMs);
    const deadline = (currentEpochBlock + 1) * fourHoursMs - offset;
    const remaining = Math.floor((deadline - now) / 1000);

    if (remaining > 0) return remaining;
    return Math.max(0, initialHours * 3600 + initialMinutes * 60 + initialSeconds);
  };

  const [timeLeft, setTimeLeft] = useState(calculateRemainingSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onExpire]);

  // Deal expired: automatically hide timer badge so product looks completely clean
  if (timeLeft <= 0) {
    return null;
  }

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className={`inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] font-black text-rose-600 bg-rose-50/90 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 rounded-md shadow-2xs ${className}`}>
      <span className="animate-pulse">⏳</span>
      <span>{hours}h : {minutes}m : {seconds}s</span>
    </div>
  );
}
