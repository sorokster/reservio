import React from "react";
import { cn } from "@/src/lib/utils";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = "md", className }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-16 h-16",
  };

  return (
    <div
      className={cn(
        "border-4 border-[#8B1C3B] border-t-transparent rounded-full animate-spin",
        sizes[size],
        className
      )}
    />
  );
};

export default Spinner;

