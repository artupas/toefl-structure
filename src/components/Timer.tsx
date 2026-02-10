'use client';

import { useState, useEffect } from 'react';

interface TimerProps {
  duration: number; // in minutes
  onTimeUp: () => void;
  isActive: boolean;
}

export default function Timer({ duration, onTimeUp, isActive }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isLowTime = timeLeft < 60; // Less than 1 minute
  const isMediumTime = timeLeft < 180 && !isLowTime; // Less than 3 minutes

  return (
    <div className={`text-2xl font-bold font-mono ${
      isLowTime ? 'text-red-600 animate-pulse' : 
      isMediumTime ? 'text-yellow-600' : 'text-blue-600'
    }`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
