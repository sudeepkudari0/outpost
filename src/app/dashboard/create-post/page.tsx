import CreatePostView from '@/components/posts/create/create-post-view';
import { client } from '@/lib/orpc/server';

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

async function getInitialData() {
  try {
    const profiles = await client.social.getProfiles();
    const selectedProfile = profiles[0]?.id ?? '';

    let accounts: ConnectedAccount[] = [];
    if (selectedProfile) {
      accounts = (await client.social.getConnectedAccounts({
        profileId: selectedProfile,
      })) as any;
    }

    return { profiles, selectedProfile, accounts };
  } catch (err) {
    return { profiles: [], selectedProfile: '', accounts: [] };
  }
}

export default async function CreatePostPage() {
  const { profiles, selectedProfile, accounts } = await getInitialData();
  return (
    <CreatePostView
      profiles={profiles as Profile[]}
      initialSelectedProfile={selectedProfile}
      initialAccounts={accounts as any}
    />
  );
}
