"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { Spinner } from "./Spinner";
import { useEffect, useState } from "react";

export const Preloader: React.FC = () => {
  const { isLoading } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Track if we've loaded at least once
  useEffect(() => {
    if (!isLoading && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [isLoading, hasLoadedOnce]);

  // Only show preloader on initial load, not when tab becomes visible again
  // or if tab is not visible
  if (!isLoading || !isVisible || hasLoadedOnce) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default Preloader;

