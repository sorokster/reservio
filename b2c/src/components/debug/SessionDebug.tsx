"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { useSession } from "next-auth/react";

export const SessionDebug: React.FC = () => {
  const { user, userRole } = useAuth();
  const { data: session } = useSession();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-md">
      <div className="font-bold mb-2">Session Debug:</div>
      <div className="space-y-1">
        <div>Groups: {JSON.stringify(user?.groups || [])}</div>
        <div>Role: {userRole}</div>
        <div>Session Groups: {JSON.stringify(session?.user?.groups || [])}</div>
      </div>
    </div>
  );
};

