'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/lib/orpc/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  Copy,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Link2,
  Linkedin as LinkedinIcon,
  Loader2,
  Plus,
  Twitter as TwitterIcon,
  Youtube as YoutubeIcon,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

const platformIcons = {
  TikTok: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z" />
    </svg>
  ),
  Instagram: (props: { className?: string }) => (
    <InstagramIcon className={props?.className ?? 'h-4 w-4'} />
  ),
  Facebook: (props: { className?: string }) => (
    <FacebookIcon className={props?.className ?? 'h-4 w-4'} />
  ),
  YouTube: (props: { className?: string }) => (
    <YoutubeIcon className={props?.className ?? 'h-4 w-4'} />
  ),
  LinkedIn: (props: { className?: string }) => (
    <LinkedinIcon className={props?.className ?? 'h-4 w-4'} />
  ),
  Twitter: (props: { className?: string }) => (
    <TwitterIcon className={props?.className ?? 'h-4 w-4'} />
  ),
  Threads: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.74-1.811-.365-.479-.856-.735-1.414-.735-.572 0-1.009.284-1.315.854-.154.287-.277.659-.38 1.115l-2.074-.452c.126-.915.445-1.718.957-2.396.938-1.244 2.277-1.875 3.989-1.875 1.799 0 3.312.49 4.51 1.456 1.198.967 1.887 2.274 2.050 3.877.039.387.06.777.06 1.167 0 .621-.03 1.242-.09 1.863-.059.62-.148 1.24-.267 1.86-.238 1.24-.623 2.34-1.155 3.3-.532.96-1.212 1.78-2.04 2.46-1.657 1.36-3.816 2.05-6.477 2.07z" />
    </svg>
  ),
};

const platformColors = {
  TikTok: 'from-slate-900 to-slate-700',
  Instagram: 'from-pink-600 to-purple-600',
  Facebook: 'from-blue-600 to-blue-700',
  YouTube: 'from-red-600 to-red-700',
  LinkedIn: 'from-blue-700 to-blue-800',
  Twitter: 'from-slate-800 to-slate-900',
  Threads: 'from-slate-900 to-purple-900',
};

interface Profile {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  isDefault?: boolean;
  createdAt?: Date;
}

interface ConnectedAccount {
  id: string;
  username: string;
  displayName?: string | null;
  profileImageUrl?: string | null;
  connectedAt: Date;
  platform: string;
  isActive: boolean;
}

interface Platform {
  name: string;
  icon: keyof typeof platformIcons;
  connected: boolean;
  accounts: ConnectedAccount[];
  requiresBYOK?: boolean;
  byokSetup?: boolean;
  supported: boolean;
}

interface ConnectionsViewProps {
  initialProfiles: Profile[];
  initialSelectedProfile?: string;
  initialPlatforms: Platform[];
}

export default function ConnectionsView({
  initialProfiles,
  initialSelectedProfile,
  initialPlatforms,
}: ConnectionsViewProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [selectedProfile, setSelectedProfile] = useState<string>(
    initialSelectedProfile || ''
  );
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(
    null
  );
  const [completingPlatform, setCompletingPlatform] = useState<string | null>(
    null
  );
  const [disconnectingAccount, setDisconnectingAccount] = useState<
    string | null
  >(null);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const initializePlatforms = (): Platform[] => [
    // {
    //   name: "TikTok",
    //   icon: "TikTok" as const,
    //   connected: false,
    //   accounts: [],
    //   supported: false,
    // },
    {
      name: 'Instagram',
      icon: 'Instagram' as const,
      connected: false,
      accounts: [],
      supported: true,
    },
    {
      name: 'Facebook',
      icon: 'Facebook' as const,
      connected: false,
      accounts: [],
      supported: true,
    },
    // {
    //   name: "YouTube",
    //   icon: "YouTube" as const,
    //   connected: false,
    //   accounts: [],
    //   supported: false,
    // },
    {
      name: 'LinkedIn',
      icon: 'LinkedIn' as const,
      connected: false,
      accounts: [],
      supported: true,
    },
    // {
    //   name: "Twitter",
    //   icon: "Twitter" as const,
    //   connected: false,
    //   accounts: [],
    //   supported: true,
    // },
    // {
    //   name: "Threads",
    //   icon: "Threads" as const,
    //   connected: false,
    //   accounts: [],
    //   supported: false,
    // },
  ];

  const profilesQuery = useQuery({
    queryKey: ['social', 'profiles'],
    queryFn: () => client.social['get-profiles'](),
    initialData: initialProfiles || [],
  });

  const quotaQuery = useQuery({
    queryKey: ['quota', 'status'],
    queryFn: () => client.quota.status(),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!selectedProfile && profilesQuery.data && profilesQuery.data.length) {
      setSelectedProfile(profilesQuery.data[0].id);
    }
  }, [profilesQuery.data, selectedProfile]);

  const accountsQuery = useQuery({
    queryKey: ['social', 'accounts', selectedProfile],
    enabled: !!selectedProfile,
    queryFn: () =>
      client.social['get-connected-accounts']({ profileId: selectedProfile }),
    initialData: (() => {
      const flat = (initialPlatforms || []).flatMap(
        p => p.accounts || []
      ) as unknown as {
        id: string;
        platform: string;
        username: string;
        displayName?: string | null;
        profileImageUrl?: string | null;
        connectedAt: Date;
        isActive: boolean;
      }[];
      return selectedProfile ? flat : undefined;
    })(),
  });

  const platforms = useMemo(() => {
    const base = initializePlatforms();
    const accounts = accountsQuery.data || [];
    accounts.forEach((account: any) => {
      const platformName =
        account.platform.charAt(0) + account.platform.slice(1).toLowerCase();
      const platform = base.find(
        p => p.name.toLowerCase() === platformName.toLowerCase()
      );
      if (platform) {
        platform.connected = true;
        platform.accounts.push(account as unknown as ConnectedAccount);
      }
    });
    return base;
  }, [accountsQuery.data]);

  const createProfile = useCallback(async () => {
    if (!newProfileName.trim()) {
      toast({
        title: 'Profile Name Required',
        description: 'Please enter a profile name.',
        variant: 'destructive',
      });
      return;
    }

    // Client-side guard for profile limit
    const maxProfiles = quotaQuery.data?.profiles.limit ?? -1;
    const usedProfiles = profilesQuery.data?.length ?? 0;
    if (maxProfiles !== -1 && usedProfiles >= maxProfiles) {
      toast({
        title: 'Profile Limit Reached',
        description: `Your plan allows ${maxProfiles} profiles. Please upgrade to add more.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreatingProfile(true);
      const newProfile = await client.social.createProfile({
        name: newProfileName.trim(),
        description: `Profile for ${newProfileName.trim()}`,
        color: '#6366f1',
      });

      toast({
        title: 'Profile Created',
        description: `Profile "${newProfileName}" has been created successfully.`,
      });

      setNewProfileName('');
      setSelectedProfile(newProfile.id);
      await queryClient.invalidateQueries({ queryKey: ['social', 'profiles'] });
      await queryClient.invalidateQueries({ queryKey: ['quota', 'status'] });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Creation Error',
        description:
          error instanceof Error ? error.message : 'Failed to create profile',
        variant: 'destructive',
      });
    } finally {
      setCreatingProfile(false);
    }
  }, [newProfileName, queryClient, toast]);

  useEffect(() => {
    const code = searchParams?.get('code');
    const state = searchParams?.get('state');
    const err = searchParams?.get('error');

    const finish = () => router.replace('/dashboard/connections');

    if (err) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect account. Please try again.',
        variant: 'destructive',
      });
      finish();
      return;
    }

    if (code && state) {
      if (
        typeof window !== 'undefined' &&
        window.opener &&
        window.opener !== window
      ) {
        try {
          window.opener.postMessage(
            { type: 'oauth-code', code, state },
            window.location.origin
          );
        } catch {}
        setTimeout(() => window.close(), 100);
        return;
      }

      try {
        const parsed = JSON.parse(Buffer.from(state, 'base64').toString()) as {
          platform: string;
          profileId: string;
        };
        setCompletingPlatform(
          parsed.platform.charAt(0) + parsed.platform.slice(1).toLowerCase()
        );
      } catch {}

      (async () => {
        try {
          let profileIdToUse = selectedProfile;
          if (!profileIdToUse) {
            try {
              const parsed = JSON.parse(
                Buffer.from(state, 'base64').toString()
              ) as { profileId: string };
              profileIdToUse = parsed.profileId;
            } catch {}
          }

          const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
          const result = await client.social['complete-connection']({
            platform: stateData.platform as any,
            profileId: stateData.profileId,
            code,
            state,
          });

          if (result.success) {
            toast({
              title: 'Connection Successful',
              description: `${stateData.platform.toLowerCase()} connected successfully.`,
            });
            if (profileIdToUse) {
              const key = ['social', 'accounts', profileIdToUse] as const;
              await queryClient.invalidateQueries({ queryKey: key });
              await queryClient.refetchQueries({ queryKey: key });
            }
            finish();
          } else {
            toast({
              title: 'Connection Failed',
              description: 'Failed to connect account. Please try again.',
              variant: 'destructive',
            });
            finish();
          }
        } catch (error) {
          toast({
            title: 'Connection Failed',
            description:
              error instanceof Error
                ? error.message
                : 'Failed to connect account',
            variant: 'destructive',
          });
          finish();
        } finally {
          setCompletingPlatform(null);
        }
      })();
    }
  }, [searchParams, router, queryClient, selectedProfile, toast]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;

      const data = event.data as {
        type?: string;
        platform?: string;
        accounts?: ConnectedAccount[];
        error?: string;
      };

      if (data?.type === 'oauth-success') {
        toast({
          title: 'Connection Successful',
          description: `${data.platform || 'Account'} connected successfully.`,
        });
        (async () => {
          if (selectedProfile) {
            const key = ['social', 'accounts', selectedProfile] as const;
            await queryClient.invalidateQueries({ queryKey: key });
            await queryClient.refetchQueries({ queryKey: key });
          }
          setConnectingPlatform(null);
        })();
      } else if (
        data?.type === 'oauth-code' &&
        (data as any).code &&
        (data as any).state
      ) {
        const code = (data as any).code as string;
        const state = (data as any).state as string;
        (async () => {
          try {
            const stateData = JSON.parse(
              Buffer.from(state, 'base64').toString()
            ) as {
              platform: string;
              profileId: string;
            };
            const platformName =
              stateData.platform.charAt(0) +
              stateData.platform.slice(1).toLowerCase();
            setCompletingPlatform(platformName);
            const result = await client.social['complete-connection']({
              platform: stateData.platform as any,
              profileId: stateData.profileId,
              code,
              state,
            });
            if (result.success) {
              toast({
                title: 'Connection Successful',
                description: `${stateData.platform.toLowerCase()} connected successfully.`,
              });
              const key = ['social', 'accounts', stateData.profileId] as const;
              await queryClient.invalidateQueries({ queryKey: key });
              await queryClient.refetchQueries({ queryKey: key });
            } else {
              toast({
                title: 'Connection Failed',
                description: 'Failed to connect account. Please try again.',
                variant: 'destructive',
              });
            }
          } catch (error) {
            toast({
              title: 'Connection Failed',
              description:
                error instanceof Error
                  ? error.message
                  : 'Failed to connect account',
              variant: 'destructive',
            });
          } finally {
            setCompletingPlatform(null);
            setConnectingPlatform(null);
          }
        })();
      } else if (data?.type === 'oauth-error') {
        toast({
          title: 'Connection Failed',
          description: data.error || 'Failed to connect account',
          variant: 'destructive',
        });
        setConnectingPlatform(null);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async (platformName: string) => {
    if (!selectedProfile) {
      toast({
        title: 'Profile Required',
        description: 'Please select a profile before connecting accounts.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setConnectingPlatform(platformName);

      const popup = window.open(
        'about:blank',
        'oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error(
          'Failed to open OAuth popup. Please allow popups for this site.'
        );
      }

      popup.document.write(
        '<p style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 16px;">Redirecting to provider…</p>'
      );

      const result = await client.social['initiate-connection']({
        platform: platformName.toUpperCase() as any,
        profileId: selectedProfile,
      });

      popup.location.href = result.authUrl;

      toast({
        title: 'Redirecting to OAuth',
        description: `Please complete the ${platformName} authentication process.`,
      });

      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setConnectingPlatform(null);
          if (selectedProfile) {
            queryClient.invalidateQueries({
              queryKey: ['social', 'accounts', selectedProfile],
            });
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Connect error:', error);
      toast({
        title: 'Connection Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to initiate connection',
        variant: 'destructive',
      });
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platformName: string, accountId: string) => {
    try {
      setDisconnectingAccount(accountId);
      await client.social['disconnect-account']({ accountId });
      if (selectedProfile) {
        await queryClient.invalidateQueries({
          queryKey: ['social', 'accounts', selectedProfile],
        });
      }
      toast({
        title: 'Account Disconnected',
        description: `${platformName} account has been disconnected.`,
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: 'Disconnect Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to disconnect account',
        variant: 'destructive',
      });
    } finally {
      setDisconnectingAccount(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'ID copied to clipboard',
    });
  };

  if (profilesQuery.isLoading || (selectedProfile && accountsQuery.isLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Loading connections...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl">
      <div className="pace-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6">
          {/* Empty State */}
          {profilesQuery.data?.length === 0 && (
            <div className="w-full flex justify-center px-4">
              <Card className="w-full max-w-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-4 sm:p-6 md:p-8">
                <CardHeader className="pb-4 text-center sm:text-left">
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Create Your First Profile
                  </CardTitle>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-prose mx-auto sm:mx-0">
                    Profiles help you connect and manage your social accounts in
                    one place. Start by creating your first profile to set up
                    your workspace and integrations.
                  </p>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <input
                      type="text"
                      placeholder="Enter profile name"
                      value={newProfileName}
                      onChange={e => setNewProfileName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && createProfile()}
                      className="flex-1 px-3 py-2 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    />
                    <Button
                      className="bg-blue-600 text-white shadow-md hover:shadow-lg hover:bg-blue-700 transition-all duration-200 text-sm sm:text-base px-4 py-2.5"
                      onClick={createProfile}
                      disabled={creatingProfile}
                    >
                      {creatingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1.5" />
                          Create Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Profile Selector */}
          {profilesQuery.data && profilesQuery.data.length > 0 && (
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block uppercase tracking-wide">
                    Active Profile
                  </label>
                  <Select
                    value={selectedProfile}
                    onValueChange={setSelectedProfile}
                  >
                    <SelectTrigger className=" border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <SelectValue placeholder="Select a profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {profilesQuery.data.map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>
                          <div className="flex items-center gap-3 py-1">
                            <div
                              className="w-3 h-3 rounded-full shadow-sm"
                              style={{
                                backgroundColor: profile.color || '#6366f1',
                              }}
                            />
                            <span className="font-medium">{profile.name}</span>
                            {profile.isDefault && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                              >
                                Default
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block uppercase tracking-wide">
                    Create New Profile
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="New profile name"
                      value={newProfileName}
                      onChange={e => setNewProfileName(e.target.value)}
                      className="px-3 py-2 bg-transparent text-sm dark:text-slate-200 placeholder:text-slate-400 min-w-[140px] border border-slate-300 dark:border-slate-700 rounded-md"
                      onKeyPress={e => e.key === 'Enter' && createProfile()}
                    />
                    <Button
                      className="bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={createProfile}
                      disabled={creatingProfile}
                      size="sm"
                    >
                      {creatingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                          Creating
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1.5" />
                          Create
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Platforms Grid */}
        {selectedProfile && (
          <div className="space-y-4 pt-8">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Platform Integrations
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {platforms.map(platform => {
                const IconComponent = platformIcons[platform.icon];
                const isConnecting = connectingPlatform === platform.name;
                const isCompleting = completingPlatform === platform.name;
                const gradientColor =
                  platformColors[platform.icon as keyof typeof platformColors];

                return (
                  <Card
                    key={platform.name}
                    className="group relative overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                  >
                    {/* Gradient Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`}
                    />

                    <CardHeader className="pb-3 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientColor} shadow-md text-white`}
                          >
                            <IconComponent />
                          </div>
                          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            {platform.name}
                          </CardTitle>
                        </div>
                        {platform.supported ? (
                          platform.connected ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 shadow-sm">
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                            >
                              Available
                            </Badge>
                          )
                        ) : (
                          <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0">
                            Soon
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 relative">
                      {!platform.supported && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          This integration is coming soon. Stay tuned for
                          updates.
                        </p>
                      )}

                      {/* Connected Accounts */}
                      {platform.connected && platform.accounts.length > 0 && (
                        <div className="space-y-2">
                          {platform.accounts.map(account => (
                            <div
                              key={account.id}
                              className="group/account rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                                    {account.displayName || account.username}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <code className="text-xs px-1.5 py-0.5 bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded font-mono">
                                      {account.id.slice(0, 8)}
                                    </code>
                                    <button
                                      className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                                      onClick={() =>
                                        copyToClipboard(account.id)
                                      }
                                      title="Copy account ID"
                                      type="button"
                                    >
                                      <Copy className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs border-slate-300 dark:border-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-800"
                                disabled={disconnectingAccount === account.id}
                                onClick={() =>
                                  handleDisconnect(platform.name, account.id)
                                }
                              >
                                {disconnectingAccount === account.id ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                    Disconnecting...
                                  </>
                                ) : (
                                  'Disconnect'
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Connection Status & Action */}
                      {platform.supported && (
                        <div className="pt-2">
                          {isCompleting ? (
                            <div className="flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 py-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="font-medium">
                                Completing authentication...
                              </span>
                            </div>
                          ) : !platform.connected ? (
                            <Button
                              size="sm"
                              className={`w-full bg-gradient-to-r ${gradientColor} hover:shadow-lg text-white font-medium transition-all duration-200`}
                              onClick={() => handleConnect(platform.name)}
                              disabled={
                                isConnecting || isCompleting || !selectedProfile
                              }
                            >
                              {isConnecting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                <>
                                  <Link2 className="h-4 w-4 mr-1.5" />
                                  Connect Account
                                </>
                              )}
                            </Button>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 py-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="font-medium">
                                Connected & Active
                              </span>
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

        {/* Footer Info */}
        {selectedProfile && (
          <div className="text-center py-8">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your social media integrations securely. All connections
              are encrypted and protected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
