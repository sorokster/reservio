"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/src/hooks/useAuth";
import { ProfileSidebar } from "@/src/components/profile";
import { HeroTitle } from "@/src/components/common/HeroTitle";
import { SectionTitle } from "@/src/components/common/SectionTitle";
import { Spinner } from "@/src/components/common/Spinner";
import { Input } from "@/src/components/common/Input";
import { Button } from "@/src/components/common/Button";
import { authService } from "@/src/services/auth.service";

export default function EditProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError("User not found");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedUser = await authService.updateProfile(user.id, {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      // Update NextAuth session with new user data
      await updateSession({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        groups: user?.groups || [],
      });

      setSuccess(true);
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        router.push("/auth/profile");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      const errorMessage = err?.data?.detail || err?.message || "Failed to update profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <HeroTitle>Edit Profile</HeroTitle>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <SectionTitle className="mb-6">Personal Information</SectionTitle>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      disabled
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                  </div>

                  {/* Email */}
                  <Input
                    type="email"
                    name="email"
                    label="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />

                  {/* First Name */}
                  <Input
                    type="text"
                    name="first_name"
                    label="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                  />

                  {/* Last Name */}
                  <Input
                    type="text"
                    name="last_name"
                    label="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                  />

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-green-800 text-sm">
                        Profile updated successfully! Refreshing...
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={loading}
                      className="flex-1"
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => router.push("/auth/profile")}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

