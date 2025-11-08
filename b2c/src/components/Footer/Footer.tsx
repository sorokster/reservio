"use client";

import React from "react";
import { FooterBrand } from "./FooterBrand";
import { FooterSection } from "./FooterSection";
import { FooterCopyright } from "./FooterCopyright";
import { FOOTER_LINKS } from "@/src/configs/footer";

const Footer: React.FC = () => {

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <FooterBrand />

          <FooterSection title="Restaurants" links={FOOTER_LINKS.restaurants} />

          <FooterSection title="Company" links={FOOTER_LINKS.company} />

          <FooterSection title="Support" links={FOOTER_LINKS.support} />
        </div>

        {/* Copyright Section */}
        <FooterCopyright />
      </div>
    </footer>
  );
};

export default Footer;
