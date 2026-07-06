import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';
import type { RestTimerPreset } from '../types';

interface TimerContextType {
  isRunning: boolean;
  isMinimized: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  activePreset: RestTimerPreset | null;
  justFinished: boolean;
  setJustFinished: (v: boolean) => void;
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
  const [justFinished, setJustFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playAlarm = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      // Loud, distinct alarm — 3 rapid beeps
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 880;
        gain.gain.value = 0.4;
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6 + i * 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.4);
        osc.stop(ctx.currentTime + 0.5 + i * 0.4);
      }
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
          playAlarm();
          setJustFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, playAlarm]);

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
          playAlarm();
          setJustFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [remainingSeconds, clearTimer, playAlarm]);

  const stopTimer = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setRemainingSeconds(0);
    setTotalSeconds(0);
    setActivePreset(null);
    setIsMinimized(false);
    setJustFinished(false);
  }, [clearTimer]);

  const minimizeTimer = useCallback(() => setIsMinimized(true), []);
  const restoreTimer = useCallback(() => setIsMinimized(false), []);

  return (
    <TimerContext.Provider value={{
      isRunning, isMinimized, remainingSeconds, totalSeconds, activePreset,
      startTimer, pauseTimer, resumeTimer, stopTimer, minimizeTimer, restoreTimer, justFinished, setJustFinished,
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
