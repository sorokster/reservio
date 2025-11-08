import React from "react";
import { cn } from "@/src/lib/utils";

export interface BlockTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const BlockTitle: React.FC<BlockTitleProps> = ({
  children,
  className,
  as: Component = "h3",
}) => {
  return (
    <Component className={cn("text-lg font-bold text-gray-900", className)}>
      {children}
    </Component>
  );
};

export default BlockTitle;

