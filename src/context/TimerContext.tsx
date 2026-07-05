import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';
import type { RestTimerPreset } from '../types';

interface TimerContextType {
  isRunning: boolean;
  isMinimized: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  activePreset: RestTimerPreset | null;
  startTimer: (minutes: RestTimerPreset) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  minimizeTimer: () => void;
  restoreTimer: () => void;
}

const TimerContext = createContext<TimerContextType | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [activePreset, setActivePreset] = useState<RestTimerPreset | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playChord = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.value = 0.3;
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + 2);
      });
    } catch {}
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback((minutes: RestTimerPreset) => {
    clearTimer();
    const totalSecs = minutes * 60;
    setRemainingSeconds(totalSecs);
    setTotalSeconds(totalSecs);
    setActivePreset(minutes);
    setIsRunning(true);
    setIsMinimized(false);

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          playChord();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, playChord]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const resumeTimer = useCallback(() => {
    if (remainingSeconds <= 0) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          playChord();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [remainingSeconds, clearTimer, playChord]);

  const stopTimer = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setRemainingSeconds(0);
    setTotalSeconds(0);
    setActivePreset(null);
    setIsMinimized(false);
  }, [clearTimer]);

  const minimizeTimer = useCallback(() => setIsMinimized(true), []);
  const restoreTimer = useCallback(() => setIsMinimized(false), []);

  return (
    <TimerContext.Provider value={{
      isRunning, isMinimized, remainingSeconds, totalSeconds, activePreset,
      startTimer, pauseTimer, resumeTimer, stopTimer, minimizeTimer, restoreTimer,
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer(): TimerContextType {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
}
