import React from "react";
import { cn } from "@/src/lib/utils";

export interface HeroTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const HeroTitle: React.FC<HeroTitleProps> = ({ children, className }) => {
  return (
    <h1 className={cn("text-3xl font-bold text-gray-900", className)}>
      {children}
    </h1>
  );
};

export default HeroTitle;

