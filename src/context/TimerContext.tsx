import React, { createContext, useContext, useEffect, useState } from "react";

interface TimerContextType {
  remainingTime: number;
  isRunning: boolean;
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [remainingTime, setRemainingTime] = useState<number>(0); // Remaining time in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false); // Tracks if the timer is running

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (remainingTime === 0) {
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingTime]);

  const startTimer = (duration: number) => {
    setRemainingTime(duration);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setRemainingTime(0);
    setIsRunning(false);
  };

  return (
    <TimerContext.Provider
      value={{ remainingTime, isRunning, startTimer, pauseTimer, resetTimer }}
    >
      {children}
    </TimerContext.Provider>
  );
};
