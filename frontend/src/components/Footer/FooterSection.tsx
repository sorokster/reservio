import React from "react";

interface FooterSectionProps {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ title, links }) => {
  return (
    <div>
      <h3 className="text-gray-900 font-semibold mb-4 text-sm uppercase tracking-wider">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-gray-600 hover:text-[#8B1C3B] transition-colors duration-200"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

