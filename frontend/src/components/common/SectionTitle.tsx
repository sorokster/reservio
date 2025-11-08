import React from "react";
import { cn } from "@/src/lib/utils";

export interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  className,
  as: Component = "h2",
}) => {
  return (
    <Component className={cn("text-2xl font-bold text-gray-900", className)}>
      {children}
    </Component>
  );
};

export default SectionTitle;

