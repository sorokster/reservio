"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { Spinner } from "@/src/components/common/Spinner";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}

