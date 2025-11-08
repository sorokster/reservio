"use client";

import React from "react";

interface NavigationLinkProps {
    href: string;
    label: string;
    className?: string;
    onClick?: () => void;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({
   href,
   label,
   className = "",
   onClick,
}) => (
  <a
    href={href}
    className="font-medium text-gray-500 hover:text-black transition-all"
    onClick={onClick}
  >
      {label}
  </a>
);

export default NavigationLink;