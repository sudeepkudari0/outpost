import { client } from '@/lib/orpc/server';
import DashboardClient from './_components/dashboard-client';

export default async function DashboardPage() {
  const postsRes = await client.posts.list({ limit: 100 });

  // Try to determine a default profile to load accounts for
  const profiles = await client.social['get-profiles']();
  const defaultProfileId =
    profiles.find(p => (p as any).isDefault)?.id || profiles[0]?.id;
  const accounts = defaultProfileId
    ? await client.social['get-connected-accounts']({
        profileId: defaultProfileId,
      })
    : [];

  // Normalize dates to ISO strings for serialization safety in props
  const posts = (postsRes.posts || []).map(p => ({
    ...p,
    createdAt: (p.createdAt as Date).toString(),
    scheduledFor: p.scheduledFor ? (p.scheduledFor as Date).toString() : null,
  }));

  const normalizedAccounts = (accounts as any[]).map(a => ({
    ...a,
    connectedAt: (a.connectedAt as Date).toString(),
  }));

  return (
    <DashboardClient
      posts={posts as any}
      accounts={normalizedAccounts as any}
    />
  );
}
