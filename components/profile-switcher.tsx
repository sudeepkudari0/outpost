"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { useProfile } from "@/components/profile-context";

export function ProfileSwitcher({ className }: { className?: string }) {
  const { profiles, profileId, setProfileId, loading } = useProfile();
  console.log("profiles", profiles);
  const selectedProfile = React.useMemo(
    () => profiles.find((p) => p.id === profileId) || null,
    [profiles, profileId]
  );

  const label =
    selectedProfile?.name ||
    selectedProfile?.slug ||
    selectedProfile?.id ||
    "Select Profile";
  const initials = (selectedProfile?.name || selectedProfile?.slug || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="px-2 py-5">
          <Button variant="outline" size="sm" className="gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="max-w-[180px] truncate">
              {loading ? "Loading..." : label}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Switch profile</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {profiles.length === 0 && (
            <DropdownMenuItem disabled>No profiles</DropdownMenuItem>
          )}
          {profiles.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              onClick={() => setProfileId(profile.id)}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {(profile.name || profile.slug || "?")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">
                  {profile.name || profile.slug || profile.id}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ProfileSwitcher;
