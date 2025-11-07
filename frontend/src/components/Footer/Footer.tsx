"use client";

import React from "react";
import {NAVIGATION} from "@/src/configs/navigation";

const Footer: React.FC = () => {
  return (
    <footer className="flex flex-col bg-white items-center justify-around w-full py-8 text-sm text-gray-800/70">
      <div className="flex items-center gap-8">
          {NAVIGATION.map((item) => (
            <a href={item.href} key={item.label} className="font-medium text-gray-500 hover:text-black transition-all">
                {item.label}
            </a>
          ))}
      </div>
      <p className="mt-8 text-center">Copyright © 2025 <a href="https://reservio.com">Reservio</a>. All rights
        reservered.</p>
    </footer>
  );
};

export default Footer;