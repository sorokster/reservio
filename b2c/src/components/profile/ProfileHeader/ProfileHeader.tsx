import React from "react";
import { cn } from "@/src/lib/utils";

type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  groups?: string[];
};

export interface ProfileHeaderProps {
  user: User;
  className?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  className,
}) => {
  const initials =
    user.first_name?.[0]?.toUpperCase() ||
    user.last_name?.[0]?.toUpperCase() ||
    user.username?.[0]?.toUpperCase() ||
    "U";

  const displayName =
    user.first_name || user.last_name
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
      : user.username || "User";

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <div className="w-24 h-24 bg-[#8B1C3B] rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
        {initials}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
        {user.username && (
          <p className="text-gray-600">@{user.username}</p>
        )}
        {user.email && (
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;

