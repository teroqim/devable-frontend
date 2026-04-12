'use client';

import { useEffect, useRef, useState } from 'react';
import './ElapsedTimer.css';

interface ElapsedTimerProps {
  isRunning: boolean;
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export default function ElapsedTimer({ isRunning }: ElapsedTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(seconds);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isRunning]);

  if (elapsed === 0) {
    return null;
  }

  return <span className="elapsed-timer">{formatElapsed(elapsed)}</span>;
}
