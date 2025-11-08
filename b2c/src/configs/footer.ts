/**
 * Footer links configuration
 */

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterLinksConfig {
  restaurants: FooterLink[];
  company: FooterLink[];
  support: FooterLink[];
}

export const FOOTER_LINKS: FooterLinksConfig = {
  restaurants: [
    { label: "Browse Restaurants", href: "/restaurants" },
    { label: "For Restaurants", href: "/restaurants/join" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;

