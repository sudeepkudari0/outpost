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
import { AlertTriangle, Copy, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
    {
      name: 'TikTok',
      icon: 'TikTok' as const,
      connected: false,
      accounts: [],
      supported: false,
    },
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
    {
      name: 'YouTube',
      icon: 'YouTube' as const,
      connected: false,
      accounts: [],
      supported: false,
    },
    {
      name: 'LinkedIn',
      icon: 'LinkedIn' as const,
      connected: false,
      accounts: [],
      supported: true,
    },
    {
      name: 'Twitter',
      icon: 'Twitter' as const,
      connected: false,
      accounts: [],
      supported: true,
    },
    {
      name: 'Threads',
      icon: 'Threads' as const,
      connected: false,
      accounts: [],
      supported: false,
    },
  ];
  // React Query: Profiles
  const profilesQuery = useQuery({
    queryKey: ['social', 'profiles'],
    queryFn: () => client.social['get-profiles'](),
    initialData: initialProfiles || [],
  });

  // Ensure a selected profile exists
  useEffect(() => {
    if (!selectedProfile && profilesQuery.data && profilesQuery.data.length) {
      setSelectedProfile(profilesQuery.data[0].id);
    }
  }, [profilesQuery.data, selectedProfile]);

  // React Query: Accounts for selected profile
  const accountsQuery = useQuery({
    queryKey: ['social', 'accounts', selectedProfile],
    enabled: !!selectedProfile,
    queryFn: () =>
      client.social['get-connected-accounts']({ profileId: selectedProfile }),
    initialData: (() => {
      // derive initial accounts from initialPlatforms
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

    try {
      setCreatingProfile(true);
      const newProfile = await client.social.createProfile({
        name: newProfileName.trim(),
        description: `Profile for ${newProfileName.trim()}`,
        color: '#ffeda0',
      });

      toast({
        title: 'Profile Created',
        description: `Profile "${newProfileName}" has been created successfully.`,
      });

      setNewProfileName('');
      setSelectedProfile(newProfile.id);
      await queryClient.invalidateQueries({ queryKey: ['social', 'profiles'] });
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

  // Handle URL params via next/navigation
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
      // If this runs in the popup, forward code/state to opener and close immediately
      if (
        typeof window !== 'undefined' &&
        window.opener &&
        window.opener !== window
      ) {
        try {
          window.opener.postMessage(
            {
              type: 'oauth-code',
              code,
              state,
            },
            window.location.origin
          );
        } catch {}
        setTimeout(() => window.close(), 100);
        return;
      }
      // Decode state to know which platform and profile we are completing
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
          // Use selectedProfile if available, else derive from state
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

  const selectedProfileData = (profilesQuery.data || []).find(
    p => p.id === selectedProfile
  );

  if (profilesQuery.isLoading || (selectedProfile && accountsQuery.isLoading)) {
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
            onChange={e => setNewProfileName(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
            onKeyPress={e => e.key === 'Enter' && createProfile()}
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
              '+ new profile'
            )}
          </Button>
        </div>
      </div>

      {profilesQuery.data?.length === 0 && (
        <div className="mb-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-medium text-yellow-800">
                  No Profiles Found
                </h3>
                <p className="text-sm text-yellow-700">
                  Create your first profile to start connecting social media
                  accounts.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {profilesQuery.data && profilesQuery.data.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Select Profile</h2>
          </div>

          <Select value={selectedProfile} onValueChange={setSelectedProfile}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a profile" />
            </SelectTrigger>
            <SelectContent>
              {profilesQuery.data.map(profile => (
                <SelectItem key={profile.id} value={profile.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: profile.color || '#ffeda0' }}
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
              <span>profile id: {selectedProfileData.id}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(selectedProfileData.id)}
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
            Platforms for {selectedProfileData?.name || 'Selected Profile'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map(platform => {
              const IconComponent = platformIcons[platform.icon];
              const isConnecting = connectingPlatform === platform.name;

              const showCardSpinner =
                isConnecting || completingPlatform === platform.name;
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

                        {platform.accounts.map(account => {
                          const isDisconnecting =
                            disconnectingAccount === account.id;

                          return (
                            <div key={account.id} className="space-y-2">
                              <div className="text-sm font-medium">
                                {account.username}
                              </div>
                              {account.displayName && (
                                <div className="text-xs text-muted-foreground">
                                  {account.displayName}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {new Date(
                                  account.connectedAt
                                ).toLocaleDateString()}
                              </div>

                              <div className="flex gap-2 pt-2">
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
                                    'disconnect'
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {!platform.supported ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                              <AlertTriangle className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-800">
                                Coming Soon
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {platform.name} integration is not available yet.
                            </p>
                          </div>
                        ) : platform.requiresBYOK && !platform.byokSetup ? (
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
                                You'll need your own API credentials to connect.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Button
                              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                              onClick={() => handleConnect(platform.name)}
                              disabled={showCardSpinner}
                            >
                              {showCardSpinner ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  connecting...
                                </>
                              ) : (
                                '+ connect'
                              )}
                            </Button>
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

      {profilesQuery.data?.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              No profiles found. Create your first profile to get started.
            </p>
            <Button
              className="bg-yellow-400 hover:bg-yellow-500 text-black"
              onClick={() => setNewProfileName('My First Profile')}
            >
              Create Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
