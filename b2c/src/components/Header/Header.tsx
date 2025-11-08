"use client";

import React, { useState, useRef, useEffect } from "react";
import NavigationLink from "./Navigation/NavigationLink";
import { NAVIGATION } from "@/src/lib/constants";
import { useAuth } from "@/src/hooks/useAuth";
import { cn } from "@/src/lib/utils";

const Header: React.FC = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    setProfileMenuOpen(false);
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
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm z-40">
      <nav className="container mx-auto px-4 flex items-center justify-between h-16 text-sm">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="font-bold text-[#8B1C3B] text-xl">Reservio</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 transition duration-500 text-slate-700">
          {NAVIGATION.map((item) => (
            <NavigationLink
              key={item.href}
              {...item}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {isAuthenticated ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="hidden md:flex items-center gap-2 px-4 py-2 hover:bg-gray-100 active:scale-95 transition-all rounded-lg text-gray-700 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
                <svg
                  className={cn(
                    "w-4 h-4 transition-transform",
                    profileMenuOpen ? "rotate-180" : ""
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[60]">
                  <a
                    href="/auth/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </a>
                  <a
                    href="/auth/profile/edit"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </a>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/auth/login"
              className="hidden md:flex items-center gap-2 px-5 py-2 bg-[#8B1C3B] hover:bg-[#6E152F] active:scale-95 transition-all rounded-lg text-white font-medium shadow-sm hover:shadow-md"
            >
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
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 active:scale-90 transition-all text-gray-700"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M4 5h16M4 12h16M4 19h16" />
          </svg>
        </button>

        {/* Mobile Menu */}
        <div
          className={`fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-all duration-300 ${
            menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => setMenuOpen(false)}
        >
          <div
            className={`bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 flex flex-col gap-6 transition-transform duration-300 ${
              menuOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {NAVIGATION.map((item) => (
              <NavigationLink
                key={item.href}
                {...item}
                className="text-gray-900 hover:text-[#8B1C3B] transition-colors"
                onClick={() => {
                  setMenuOpen(false);
                }}
              />
            ))}

            {isAuthenticated ? (
              <div className="border-t border-gray-200 pt-6 mt-2">
                <a
                  href="/auth/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-900 hover:text-[#8B1C3B] transition-colors mb-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </a>
                <a
                  href="/auth/profile/edit"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-900 hover:text-[#8B1C3B] transition-colors mb-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </a>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            ) : (
              <a
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 bg-[#8B1C3B] hover:bg-[#6E152F] text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </a>
            )}

            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
