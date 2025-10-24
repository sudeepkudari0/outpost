import ConnectionsView from '@/components/connections/connection-view';
import { client } from '@/lib/orpc/server';
import { Suspense } from 'react';

type Profile = {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  isDefault?: boolean;
  createdAt?: Date;
};

type ConnectedAccount = {
  id: string;
  username: string;
  displayName?: string | null;
  profileImageUrl?: string | null;
  connectedAt: Date;
  platform: string;
  isActive: boolean;
};

type Platform = {
  name: string;
  icon:
    | 'TikTok'
    | 'Instagram'
    | 'Facebook'
    | 'YouTube'
    | 'LinkedIn'
    | 'Twitter'
    | 'Threads';
  connected: boolean;
  accounts: ConnectedAccount[];
  requiresBYOK?: boolean;
  byokSetup?: boolean;
  supported: boolean;
};

function initializePlatforms(): Platform[] {
  return [
    {
      name: 'TikTok',
      icon: 'TikTok',
      connected: false,
      accounts: [],
      supported: false,
    },
    {
      name: 'Instagram',
      icon: 'Instagram',
      connected: false,
      accounts: [],
      supported: true,
    },
    {
      name: 'Facebook',
      icon: 'Facebook',
      connected: false,
      accounts: [],
      supported: true,
    },
    {
      name: 'YouTube',
      icon: 'YouTube',
      connected: false,
      accounts: [],
      supported: false,
    },
    {
      name: 'LinkedIn',
      icon: 'LinkedIn',
      connected: false,
      accounts: [],
      supported: false,
    },
    {
      name: 'Twitter',
      icon: 'Twitter',
      connected: false,
      accounts: [],
      requiresBYOK: true,
      byokSetup: false,
      supported: false,
    },
    {
      name: 'Threads',
      icon: 'Threads',
      connected: false,
      accounts: [],
      supported: false,
    },
  ];
}

async function getInitialData() {
  try {
    const profiles = await client.social['get-profiles']();
    const selectedProfile = profiles[0]?.id ?? '';

    let platforms: Platform[] = initializePlatforms();

    if (selectedProfile) {
      const accounts = await client.social['get-connected-accounts']({
        profileId: selectedProfile,
      });

      const updated = initializePlatforms();
      accounts.forEach((account: any) => {
        const platformName =
          account.platform.charAt(0) + account.platform.slice(1).toLowerCase();
        const platform = updated.find(
          p => p.name.toLowerCase() === platformName.toLowerCase()
        );
        if (platform) {
          platform.connected = true;
          platform.accounts.push(account as ConnectedAccount);
        }
      });
      platforms = updated;
    }

    return { profiles, selectedProfile, platforms };
  } catch (err) {
    // Gracefully handle unauthenticated or other server errors
    console.error('error', err);
    return {
      profiles: [],
      selectedProfile: '',
      platforms: initializePlatforms(),
    };
  }
}

export default async function ConnectionsPage() {
  const { profiles, selectedProfile, platforms } = await getInitialData();
  return (
    <Suspense>
      <ConnectionsView
        initialProfiles={profiles as Profile[]}
        initialSelectedProfile={selectedProfile}
        initialPlatforms={platforms as Platform[]}
      />
    </Suspense>
  );
}
