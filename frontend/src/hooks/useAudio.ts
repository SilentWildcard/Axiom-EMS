import { useState, useEffect, useRef, useCallback } from 'react';
import { createSiren } from '../utils/audio';

export type SirenStatus = 'idle' | 'armed' | 'playing' | 'completed' | 'cancelled';

export function useAudio(volume: number = 0.6, durationS: number = 10) {
  const [status, setStatus] = useState<SirenStatus>('idle');
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [blocked, setBlocked] = useState(false);
  const sirenRef = useRef(createSiren(volume));
  const endTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Recreate siren if volume changes
  useEffect(() => {
    if (sirenRef.current.isPlaying()) {
      sirenRef.current.stop();
    }
    sirenRef.current = createSiren(volume);
  }, [volume]);

  const clearCountdown = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const play = useCallback(() => {
    if (sirenRef.current.isPlaying()) return;

    const durationMs = durationS * 1000;
    endTimeRef.current = Date.now() + durationMs;

    try {
      sirenRef.current.play(durationMs);
      setStatus('playing');
      setRemainingMs(durationMs);
      setBlocked(false);

      // Countdown uses Date.now() difference, not a simple decrement
      timerRef.current = setInterval(() => {
        const remaining = endTimeRef.current - Date.now();
        if (remaining <= 0) {
          clearCountdown();
          setRemainingMs(0);
          setStatus('completed');
        } else {
          setRemainingMs(remaining);
        }
      }, 100);
    } catch {
      setBlocked(true);
      setStatus('idle');
    }
  }, [durationS]);

  const stop = useCallback(() => {
    sirenRef.current.stop();
    clearCountdown();
    setRemainingMs(0);
    setStatus('cancelled');
  }, []);

  const arm = useCallback(() => {
    setStatus('armed');
  }, []);

  const disarm = useCallback(() => {
    if (sirenRef.current.isPlaying()) {
      sirenRef.current.stop();
      clearCountdown();
    }
    setStatus('idle');
    setRemainingMs(0);
  }, []);

  useEffect(() => () => {
    sirenRef.current.stop();
    clearCountdown();
  }, []);

  return {
    status,
    remainingMs,
    remainingS: Math.ceil(remainingMs / 1000),
    blocked,
    play,
    stop,
    arm,
    disarm,
    isPlaying: status === 'playing',
  };
}
