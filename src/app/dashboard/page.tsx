import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, BarChart3, Calendar, Clock } from 'lucide-react';
import NextLink from 'next/link';
import { cookies } from 'next/headers';

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get('profile_id')?.value;
  const postsQuery = new URLSearchParams({ limit: '100' });
  if (profileId) postsQuery.set('profileId', profileId);
  const accountsQuery = new URLSearchParams();
  if (profileId) accountsQuery.set('profileId', profileId);

  const [postsRes, accountsRes] = await Promise.all([
    fetch(`${baseUrl}/api/posts?${postsQuery.toString()}`, {
      cache: 'no-store',
    }),
    fetch(`${baseUrl}/api/late/accounts?${accountsQuery.toString()}`, {
      cache: 'no-store',
    }),
  ]);

  const postsJson = postsRes.ok ? await postsRes.json() : { posts: [] };
  const accountsJson = accountsRes.ok
    ? await accountsRes.json()
    : { accounts: [] };

  const posts: any[] = Array.isArray(postsJson.posts) ? postsJson.posts : [];
  const accounts: any[] = Array.isArray(accountsJson.accounts)
    ? accountsJson.accounts
    : [];

  const totalPosts = posts.length;
  const scheduledPosts = posts.filter(p => p.status === 'scheduled');
  const scheduledCount = scheduledPosts.length;
  const upcoming = scheduledPosts
    .map(p => new Date(p.scheduledFor || p.scheduled_at || p.scheduled || 0))
    .filter(d => !isNaN(d.getTime()) && d.getTime() >= Date.now())
    .sort((a, b) => a.getTime() - b.getTime());
  const nextScheduled = upcoming[0] ? upcoming[0].toISOString() : null;

  const connectedAccounts = accounts.length;
  const uniquePlatforms = new Set(
    accounts.map(a => a.platform).filter((x: any) => !!x)
  );

  const recentActivity = posts
    .map(p => ({
      id: p.id || p._id,
      status: p.status,
      platform: Array.isArray(p.platforms)
        ? p.platforms.map((x: any) =>
            typeof x === 'string' ? x : x.platform
          )[0]
        : undefined,
      createdAt:
        p.createdAt || p.created_at || p.scheduledFor || p.scheduled_at,
      content: p.content,
    }))
    .sort((a, b) => {
      const ad = new Date(a.createdAt || 0).getTime();
      const bd = new Date(b.createdAt || 0).getTime();
      return bd - ad;
    })
    .slice(0, 3);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your social media management hub
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">from Late</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledCount}</div>
            <p className="text-xs text-muted-foreground">
              Next: {formatDateTime(nextScheduled)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Connected Accounts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedAccounts}</div>
            <p className="text-xs text-muted-foreground">
              Across {uniquePlatforms.size} platform
              {uniquePlatforms.size === 1 ? '' : 's'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create Content
            </CardTitle>
            <CardDescription>
              Generate and publish new social media posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NextLink href="/dashboard/create-post">
              <Button className="w-full">Create New Post</Button>
            </NextLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Manage Posts
            </CardTitle>
            <CardDescription>
              View and edit your scheduled and published content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NextLink href="/dashboard/posts">
              <Button variant="outline" className="w-full bg-transparent">
                View All Posts
              </Button>
            </NextLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Connect Accounts
            </CardTitle>
            <CardDescription>Link your social media platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <NextLink href="/dashboard/connections">
              <Button variant="outline" className="w-full bg-transparent">
                Manage Connections
              </Button>
            </NextLink>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest posts and scheduled content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No recent activity.
              </div>
            )}
            {recentActivity.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 border rounded-lg"
              >
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  {item.status === 'scheduled' ? (
                    <Clock className="h-6 w-6" />
                  ) : (
                    <FileText className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {item.status === 'scheduled'
                      ? 'Post scheduled'
                      : 'Post published'}
                    {item.platform ? ` to ${item.platform}` : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 text-xs rounded ${
                    item.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {item.status === 'scheduled' ? 'Scheduled' : 'Published'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
