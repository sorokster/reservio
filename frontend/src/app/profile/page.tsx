"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-center items-center">
          <div className="w-16 h-16 border-4 border-[#8B1C3B] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-[#8B1C3B] rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.first_name?.[0]?.toUpperCase() || user.last_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.first_name || user.last_name
                  ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                  : user.username || "User"}
              </h2>
              {user.username && <p className="text-gray-600">@{user.username}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <p className="text-gray-900">{user.email || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <p className="text-gray-900">{user.username || "Not provided"}</p>
            </div>
            {user.first_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <p className="text-gray-900">{user.first_name}</p>
              </div>
            )}
            {user.last_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <p className="text-gray-900">{user.last_name}</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 flex-wrap">
            <a
              href="/profile/edit"
              className="px-6 py-3 bg-[#8B1C3B] hover:bg-[#6E152F] text-white rounded-xl font-medium transition-all active:scale-95"
            >
              Edit Profile
            </a>
            <a
              href="/profile/reservations"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium transition-all active:scale-95"
            >
              View Reservations
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
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

