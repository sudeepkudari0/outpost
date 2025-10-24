import CreatePostView from '@/components/posts/create/create-post-view';
import { client } from '@/lib/orpc/server';
import { ConnectedAccount } from '@prisma/client';

async function getInitialData() {
  try {
    const profiles = await client.social['get-profiles']();
    const selectedProfile = profiles[0]?.id ?? '';

    let accounts: ConnectedAccount[] = [];
    if (selectedProfile) {
      accounts = (await client.social['get-connected-accounts']({
        profileId: selectedProfile,
      })) as ConnectedAccount[];
    }

    return { profiles, selectedProfile, accounts };
  } catch (err) {
    return { profiles: [], selectedProfile: '', accounts: [] };
    console.error('error', err);
  }
}

export default async function CreatePostPage() {
  const { profiles, selectedProfile, accounts } = await getInitialData();
  return (
    <CreatePostView
      profiles={profiles}
      initialSelectedProfile={selectedProfile}
      initialAccounts={accounts}
    />
  );
}
