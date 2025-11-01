import CreatePostView from '@/components/posts/create/create-post-view';
import { client } from '@/lib/orpc/server';
import { ConnectedAccount } from '@prisma/client';

async function getInitialData(editPostId?: string) {
  try {
    const profiles = await client.social['get-profiles']();
    const selectedProfile = profiles[0]?.id ?? '';

    let accounts: ConnectedAccount[] = [];
    if (selectedProfile) {
      accounts = (await client.social['get-connected-accounts']({
        profileId: selectedProfile,
      })) as ConnectedAccount[];
    }

    let postData = null;
    if (editPostId) {
      try {
        postData = await client.posts.get({ id: editPostId });
      } catch (err) {
        console.error('Failed to load post for editing:', err);
      }
    }

    return { profiles, selectedProfile, accounts, postData };
  } catch (err) {
    return { profiles: [], selectedProfile: '', accounts: [], postData: null };
    console.error('error', err);
  }
}

export default async function CreatePostPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const editPostId = (await searchParams)?.edit;
  const { profiles, selectedProfile, accounts, postData } =
    await getInitialData(editPostId);
  return (
    <CreatePostView
      profiles={profiles}
      initialSelectedProfile={selectedProfile}
      initialAccounts={accounts}
      editPostId={editPostId}
      initialPostData={postData}
    />
  );
}
