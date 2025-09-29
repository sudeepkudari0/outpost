"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  Edit,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const platformIcons = {
  TikTok: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z" />
    </svg>
  ),
  Instagram: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.073-1.689-.073-4.948 0-3.259.014-3.668.072-4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689-.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  Facebook: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s -12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  YouTube: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.564v11.452zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  Twitter: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Threads: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.74-1.811-.365-.479-.856-.735-1.414-.735-.572 0-1.009.284-1.315.854-.154.287-.277.659-.38 1.115l-2.074-.452c.126-.915.445-1.718.957-2.396.938-1.244 2.277-1.875 3.989-1.875 1.799 0 3.312.49 4.51 1.456 1.198.967 1.887 2.274 2.050 3.877.039.387.06.777.06 1.167 0 .621-.03 1.242-.09 1.863-.059.62-.148 1.24-.267 1.86-.238 1.24-.623 2.34-1.155 3.3-.532.96-1.212 1.78-2.04 2.46-1.657 1.36-3.816 2.05-6.477 2.07z" />
    </svg>
  ),
};

interface Profile {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
  createdAt?: string;
}

interface ConnectedAccount {
  id: string;
  username: string;
  connectedDate: string;
  profileId?: string;
  platform: string;
}

interface Platform {
  name: string;
  icon: keyof typeof platformIcons;
  connected: boolean;
  accounts: ConnectedAccount[];
  requiresBYOK?: boolean;
  byokSetup?: boolean;
}

export default function ConnectionsPage() {
  const { toast } = useToast();
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(
    null
  );
  const [disconnectingAccount, setDisconnectingAccount] = useState<
    string | null
  >(null);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  const fetchProfiles = async () => {
    try {
      const response = await fetch("/api/late/profiles");

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "Late API key not configured") {
          toast({
            title: "Configuration Required",
            description:
              "Please configure your Late API key in the API Keys section.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(errorData.error || "Failed to fetch profiles");
      }

      const data = await response.json();
      console.log("[v0] Fetched profiles:", data);

      if (data.profiles && Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
        // Set first profile as selected if none selected
        if (!selectedProfile && data.profiles.length > 0) {
          const firstProfileId = data.profiles[0]._id;
          setSelectedProfile(firstProfileId);

          try {
            console.log(
              "[v0] Attempting to save profile ID to settings:",
              firstProfileId
            );
            const saveResponse = await fetch("/api/settings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lateProfileId: firstProfileId,
              }),
            });

            if (!saveResponse.ok) {
              const errorData = await saveResponse.json();
              console.error(
                "[v0] Failed to save profile ID - response not ok:",
                errorData
              );
              throw new Error(errorData.error || "Failed to save profile ID");
            }

            const saveResult = await saveResponse.json();
            console.log("[v0] Profile ID save result:", saveResult);

            // Verify the profile ID was actually saved
            const verifyResponse = await fetch("/api/settings");
            if (verifyResponse.ok) {
              const currentSettings = await verifyResponse.json();
              console.log("[v0] Current settings after save:", currentSettings);

              if (currentSettings.lateProfileId === firstProfileId) {
                console.log("[v0] Profile ID successfully saved and verified");
                toast({
                  title: "Profile Selected",
                  description: `Profile "${data.profiles[0].name}" is now active for connections.`,
                });
              } else {
                console.error(
                  "[v0] Profile ID verification failed - not saved correctly"
                );
              }
            }
          } catch (error) {
            console.error("[v0] Failed to auto-save profile ID:", error);
            toast({
              title: "Profile Selection Warning",
              description:
                "Profile selected but may need manual configuration in API Keys.",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching profiles:", error);
      toast({
        title: "Profile Error",
        description:
          "Failed to load profiles. Please check your Late API configuration.",
        variant: "destructive",
      });
    }
  };

  const createProfile = async () => {
    if (!newProfileName.trim()) {
      toast({
        title: "Profile Name Required",
        description: "Please enter a profile name.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatingProfile(true);
      const response = await fetch("/api/late/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProfileName.trim(),
          description: `Profile for ${newProfileName.trim()}`,
          color: "#ffeda0",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create profile");
      }

      const newProfile = await response.json();
      console.log("[v0] Created profile:", newProfile);

      if (newProfile.profile && newProfile.profile._id) {
        try {
          console.log(
            "[v0] Attempting to save new profile ID to settings:",
            newProfile.profile._id
          );
          const saveResponse = await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lateProfileId: newProfile.profile._id,
            }),
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            console.error("[v0] Failed to save new profile ID:", errorData);
            throw new Error(errorData.error || "Failed to save profile ID");
          }

          const saveResult = await saveResponse.json();
          console.log("[v0] New profile ID save result:", saveResult);
        } catch (error) {
          console.error("[v0] Failed to auto-save new profile ID:", error);
          toast({
            title: "Profile Created with Warning",
            description:
              "Profile created but may need manual configuration in API Keys.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Profile Created",
        description: `Profile "${newProfileName}" has been created successfully.`,
      });

      setNewProfileName("");
      await fetchProfiles();
    } catch (error) {
      console.error("[v0] Error creating profile:", error);
      toast({
        title: "Creation Error",
        description:
          error instanceof Error ? error.message : "Failed to create profile",
        variant: "destructive",
      });
    } finally {
      setCreatingProfile(false);
    }
  };

  const initializePlatforms = () => [
    {
      name: "TikTok",
      icon: "TikTok" as const,
      connected: false,
      accounts: [] as ConnectedAccount[],
    },
    {
      name: "Instagram",
      icon: "Instagram" as const,
      connected: false,
      accounts: [] as ConnectedAccount[],
    },
    {
      name: "Facebook",
      icon: "Facebook" as const,
      connected: false,
      accounts: [] as ConnectedAccount[],
    },
    {
      name: "YouTube",
      icon: "YouTube" as const,
      connected: false,
      accounts: [] as ConnectedAccount[],
    },
    {
      name: "LinkedIn",
      icon: "LinkedIn" as const,
      connected: false,
      accounts: [] as ConnectedAccount[],
    },
    {
      name: "Twitter",
      icon: "Twitter" as const,
      connected: false,
      accounts: [] as ConnectedAccount[],
      requiresBYOK: true,
      byokSetup: false,
    },
    {
      name: "Threads",
      icon: "Threads" as const,
      connected: false,
      accounts: [] as ConnectedAccount[],
    },
  ];

  const fetchConnectedAccounts = async () => {
    if (!selectedProfile) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/late/accounts?profileId=${selectedProfile}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "Late configuration missing") {
          toast({
            title: "Configuration Required",
            description:
              "Please configure your Late API credentials in the API Keys section.",
            variant: "destructive",
          });
          setPlatforms(initializePlatforms());
          return;
        }
        throw new Error(errorData.error || "Failed to fetch accounts");
      }

      const data = await response.json();
      console.log("[v0] Fetched accounts:", data);

      const updatedPlatforms = initializePlatforms();

      if (data.accounts && Array.isArray(data.accounts)) {
        data.accounts.forEach((account: any) => {
          const platformName =
            account.platform?.charAt(0).toUpperCase() +
            account.platform?.slice(1);
          const platform = updatedPlatforms.find(
            (p) => p.name.toLowerCase() === account.platform?.toLowerCase()
          );

          if (platform) {
            platform.connected = true;
            platform.accounts.push({
              id: account.id || account.accountId || "unknown",
              username: account.username || account.name || "Unknown User",
              connectedDate: account.connectedAt
                ? new Date(account.connectedAt).toLocaleDateString()
                : new Date().toLocaleDateString(),
              profileId:
                typeof account.profileId === "string"
                  ? account.profileId
                  : account.profileId?._id || "",
              platform: account.platform,
            });
          }
        });
      }

      setPlatforms(updatedPlatforms);
    } catch (error) {
      console.error("[v0] Error fetching accounts:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast({
        title: "Connection Error",
        description: `Failed to load connected accounts: ${errorMessage}`,
        variant: "destructive",
      });

      setPlatforms(initializePlatforms());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (selectedProfile) {
      fetchConnectedAccounts();
    }
  }, [selectedProfile]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connectedPlatform = urlParams.get("connected");

    if (connectedPlatform) {
      toast({
        title: "Connection Successful",
        description: `${connectedPlatform} account has been connected successfully.`,
      });
      setTimeout(() => {
        fetchConnectedAccounts();
      }, 1000);

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleConnect = async (platformName: string) => {
    if (!selectedProfile) {
      toast({
        title: "Profile Required",
        description: "Please select a profile before connecting accounts.",
        variant: "destructive",
      });
      return;
    }

    try {
      setConnectingPlatform(platformName);

      console.log(
        "[v0] Attempting to connect platform:",
        platformName,
        "with profile:",
        selectedProfile
      );

      const response = await fetch("/api/late/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: platformName.toLowerCase(),
          profileId: selectedProfile,
        }),
      });

      const data = await response.json();
      console.log("[v0] Connect response:", data);

      if (data.error === "Late configuration missing") {
        console.error("[v0] Late configuration missing:", data.missing);
        toast({
          title: "Configuration Required",
          description:
            "Please configure your Late API credentials in the API Keys section.",
          variant: "destructive",
        });
        setConnectingPlatform(null);
        return;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.connectUrl) {
        console.log("[v0] Opening OAuth popup with URL:", data.connectUrl);
        const popup = window.open(
          data.connectUrl,
          "oauth",
          "width=600,height=600,scrollbars=yes,resizable=yes"
        );

        if (!popup) {
          throw new Error(
            "Failed to open OAuth popup. Please allow popups for this site."
          );
        }

        toast({
          title: "Redirecting to OAuth",
          description: `Please complete the ${platformName} authentication process.`,
        });

        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setConnectingPlatform(null);
            console.log("[v0] OAuth popup closed, refreshing accounts");
            setTimeout(() => {
              fetchConnectedAccounts();
            }, 1000);
          }
        }, 1000);
      } else {
        throw new Error("No OAuth URL received from server");
      }
    } catch (error) {
      console.error("[v0] Connect error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Connection Error",
        description: `Failed to connect ${platformName}: ${errorMessage}`,
        variant: "destructive",
      });
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platformName: string, accountId: string) => {
    try {
      setDisconnectingAccount(accountId);

      const response = await fetch("/api/late/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: platformName.toLowerCase(),
          accountId,
        }),
      });

      if (response.ok) {
        setPlatforms((prev) =>
          prev.map((platform) => {
            if (platform.name === platformName) {
              const updatedAccounts = platform.accounts.filter(
                (acc) => acc.id !== accountId
              );
              return {
                ...platform,
                accounts: updatedAccounts,
                connected: updatedAccounts.length > 0,
              };
            }
            return platform;
          })
        );

        toast({
          title: "Account Disconnected",
          description: `${platformName} account has been disconnected.`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Disconnect failed");
      }
    } catch (error) {
      console.error("[v0] Disconnect error:", error);
      toast({
        title: "Disconnect Error",
        description: "Failed to disconnect account.",
        variant: "destructive",
      });
    } finally {
      setDisconnectingAccount(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "ID copied to clipboard",
    });
  };

  const selectedProfileData = profiles.find((p) => p._id === selectedProfile);

  if (loading && profiles.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Connections</h1>
            <p className="text-muted-foreground">
              manage profiles and platform integrations
            </p>
          </div>
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
            + new profile
          </Button>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profiles and accounts...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Connections</h1>
          <p className="text-muted-foreground">
            manage profiles and platform integrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Profile name"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
            onKeyPress={(e) => e.key === "Enter" && createProfile()}
          />
          <Button
            className="bg-yellow-400 hover:bg-yellow-500 text-black"
            onClick={createProfile}
            disabled={creatingProfile}
          >
            {creatingProfile ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                creating...
              </>
            ) : (
              "+ new profile"
            )}
          </Button>
        </div>
      </div>

      {profiles.length === 0 && !loading && (
        <div className="mb-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-medium text-yellow-800">
                  Configuration Required
                </h3>
                <p className="text-sm text-yellow-700">
                  To get started, you need to configure your Late API
                  credentials and create your first profile.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("/dashboard/api-keys", "_blank")}
                    className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                  >
                    Configure API Keys
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {profiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Select Profile</h2>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 bg-transparent"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              delete
            </Button>
          </div>

          <Select value={selectedProfile} onValueChange={setSelectedProfile}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a profile" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((profile) => (
                <SelectItem key={profile._id} value={profile._id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: profile.color || "#ffeda0" }}
                    />
                    {profile.name}
                    {profile.isDefault && (
                      <Badge variant="secondary">default</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedProfileData && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>profile id: {selectedProfileData._id}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(selectedProfileData._id)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      {selectedProfile && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Platforms for {selectedProfileData?.name || "Selected Profile"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => {
              const IconComponent = platformIcons[platform.icon];
              const isConnecting = connectingPlatform === platform.name;

              return (
                <Card key={platform.name} className="relative">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <IconComponent />
                      {platform.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {platform.connected && platform.accounts.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm font-medium text-green-600">
                            Connected
                          </span>
                        </div>

                        {platform.accounts.map((account) => {
                          const isDisconnecting =
                            disconnectingAccount === account.id;

                          return (
                            <div key={account.id} className="space-y-2">
                              <div className="text-sm font-medium">
                                {account.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {account.connectedDate}
                              </div>
                              {account.profileId && (
                                <div className="text-xs text-muted-foreground">
                                  {account.profileId}
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>id: {account.id}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(account.id)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="flex gap-2 pt-2">
                                {platform.name === "LinkedIn" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs bg-transparent"
                                  >
                                    manage account
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs bg-transparent"
                                  onClick={() =>
                                    handleDisconnect(platform.name, account.id)
                                  }
                                  disabled={isDisconnecting}
                                >
                                  {isDisconnecting ? (
                                    <>
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      disconnecting...
                                    </>
                                  ) : (
                                    "disconnect"
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {platform.requiresBYOK && !platform.byokSetup ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-md">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm font-medium text-yellow-800">
                                setup BYOK first
                              </span>
                            </div>

                            <div className="p-3 bg-purple-50 rounded-md space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                <span className="text-sm font-medium text-purple-700">
                                  BYOK Required
                                </span>
                              </div>
                              <p className="text-xs text-purple-600">
                                You'll need your own X API credentials to
                                connect.
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs bg-transparent"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                copy
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs bg-transparent"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                invite link
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Button
                              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                              onClick={() => handleConnect(platform.name)}
                              disabled={isConnecting}
                            >
                              {isConnecting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  connecting...
                                </>
                              ) : (
                                "+ connect"
                              )}
                            </Button>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs bg-transparent"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                copy
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs bg-transparent"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                invite link
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {profiles.length === 0 && !loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              No profiles found. Create your first profile to get started.
            </p>
            <Button
              className="bg-yellow-400 hover:bg-yellow-500 text-black"
              onClick={() => setNewProfileName("My First Profile")}
            >
              Create Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
