import React, { createContext, useState, useContext } from "react";

interface FloatingBannerContextType {
  isBannerVisible: boolean;
  showBanner: () => void;
  hideBanner: () => void;
}

// Provider component
interface FloatingBannerProviderProps {
  children: React.ReactNode; // Explicitly type the children prop
}
// Create the context
const FloatingBannerContext = createContext<
  FloatingBannerContextType | undefined
>(undefined);

// Provider component
export const FloatingBannerProvider: React.FC<FloatingBannerProviderProps> = ({
  children,
}) => {
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const showBanner = () => {
    setIsBannerVisible(true);
  };

  const hideBanner = () => {
    setIsBannerVisible(false);
  };

  return (
    <FloatingBannerContext.Provider
      value={{ isBannerVisible, showBanner, hideBanner }}
    >
      {children}
    </FloatingBannerContext.Provider>
  );
};

// Custom hook to use the context
export const useFloatingBanner = () => {
  const context = useContext(FloatingBannerContext);
  if (!context) {
    throw new Error(
      "useFloatingBanner must be used within a FloatingBannerProvider"
    );
  }
  return context;
};
