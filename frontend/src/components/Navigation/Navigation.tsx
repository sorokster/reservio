"use client";

import React, { useState } from "react";
import NavigationLink from "@/src/components/Navigation/NavigationLink";
import {NavigationItem} from "@/src/types/navigation-item";
import { useAuth } from "@/src/hooks/useAuth";

interface NavigationProps {
  navigation: NavigationItem[];
  onClickLink?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  navigation,
  onClickLink,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { isAuthenticated, user, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <nav className="container container mx-auto px-4 flex items-center justify-between w-full mx-auto  text-sm">
      <a href="/">
        <span className="font-bold text-[#8B1C3B] text-xl">Reservio</span>
      </a>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8 transition duration-500 text-slate-800">
        {navigation.map((item) => (
          <NavigationLink
            key={item.href}
            {...item}
            onClick={onClickLink}
          />
        ))}
      </div>

      <div className="flex gap-2">
        {isAuthenticated ? (
          <>
            <a href="/profile"
               className="hidden md:flex items-center gap-2 px-6 py-2 bg-[#8B1C3B] hover:bg-[#6E152F] active:scale-95 transition-all rounded-full text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </a>
            <button
              onClick={async () => {
                setLoggingOut(true);
                try {
                  // Logout from Django backend
                  await fetch("/api/logout", {
                    method: "POST",
                    credentials: "include",
                  });
                  // Logout from NextAuth
                  await signOut();
                } catch (error) {
                  console.error("Logout error:", error);
                  // Still try to logout from NextAuth even if Django logout fails
                  await signOut();
                } finally {
                  setLoggingOut(false);
                }
              }}
              disabled={loggingOut}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 transition-all rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {loggingOut ? "..." : "Logout"}
            </button>
          </>
        ) : (
          <a href="/login"
             className="hidden md:flex items-center gap-2 px-6 py-2 bg-[#8B1C3B] hover:bg-[#6E152F] active:scale-95 transition-all rounded-full text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Sign In</span>
          </a>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMenuOpen(true)}
        className="md:hidden active:scale-90 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" stroke="currentColor" strokeWidth="2">
          <path d="M4 5h16M4 12h16M4 19h16"/>
        </svg>
      </button>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[100] bg-black/40 text-black backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navigation.map((item) => (
          <NavigationLink
            key={item.href}
            {...item}
            className="text-white"
            onClick={() => {
              onClickLink?.();
              setMenuOpen(false);
            }}
          />
        ))}

        <button
          onClick={() => setMenuOpen(false)}
          className="active:ring-3 active:ring-white aspect-square size-10 p-1 bg-[#8B1C3B] rounded-md text-white"
        >
          X
        </button>
      </div>
    </nav>
  );
};

export default Navigation;