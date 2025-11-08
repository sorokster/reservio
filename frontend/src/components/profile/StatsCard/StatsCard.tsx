import React from "react";
import { cn } from "@/src/lib/utils";

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  className,
  variant = "default",
}) => {
  const variantClasses = {
    default: "bg-white border-gray-200",
    primary: "bg-[#8B1C3B]/5 border-[#8B1C3B]/20",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    danger: "bg-red-50 border-red-200",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-6 transition-all hover:shadow-md",
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default StatsCard;

