'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart3, Calendar, Clock, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

type PostItem = {
  id: string;
  content: any;
  mediaUrls?: string[];
  status: string;
  scheduledFor?: string | Date | null;
  createdAt: string | Date;
  platforms: { platform: string }[];
};

type AccountItem = {
  id: string;
  platform: string;
  username: string;
  displayName?: string | null;
  profileImageUrl?: string | null;
  connectedAt: string | Date;
  isActive: boolean;
};

function toDate(input?: string | Date | null) {
  if (!input) return null;
  const d = new Date(input as any);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export default function DashboardClient({
  posts,
  accounts,
}: {
  posts: PostItem[];
  accounts: AccountItem[];
}) {
  function StatCard({
    title,
    icon,
    value,
    subtitle,
  }: {
    title: string;
    icon: ReactNode;
    value: ReactNode;
    subtitle?: ReactNode;
  }) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const totalPosts = posts.length;

  const scheduledPosts = posts.filter(
    p => (p.status || '').toLowerCase() === 'scheduled'
  );
  const scheduledCount = scheduledPosts.length;
  const upcoming = scheduledPosts
    .map(p => toDate((p as any).scheduledFor || (p as any).scheduled_at))
    .filter((d): d is Date => !!d && d.getTime() >= Date.now())
    .sort((a, b) => a.getTime() - b.getTime());
  const nextScheduled = upcoming[0] ? upcoming[0].toISOString() : null;

  const connectedAccounts = accounts.length;
  const uniquePlatforms = new Set(
    accounts.map(a => a.platform).filter(x => !!x)
  );

  const recentActivity = posts
    .map(p => ({
      id: (p as any).id,
      status: (p as any).status,
      platform: Array.isArray((p as any).platforms)
        ? (p as any).platforms.map((x: any) =>
            typeof x === 'string' ? x : x.platform
          )[0]
        : undefined,
      createdAt:
        ((p as any).createdAt as any) ||
        (p as any).scheduledFor ||
        (p as any).scheduled_at,
      content: (p as any).content,
    }))
    .sort((a, b) => {
      const ad = new Date(a.createdAt || 0).getTime();
      const bd = new Date(b.createdAt || 0).getTime();
      return bd - ad;
    })
    .slice(0, 3);

  return (
    <div className="pr-2 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Posts"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          value={totalPosts}
          subtitle={'from Meta'}
        />

        <StatCard
          title="Scheduled"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          value={scheduledCount}
          subtitle={`Next: ${formatDateTime(nextScheduled)}`}
        />

        <StatCard
          title="Connected Accounts"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          value={connectedAccounts}
          subtitle={`Across ${uniquePlatforms.size} platform${
            uniquePlatforms.size === 1 ? '' : 's'
          }`}
        />

        <StatCard
          title="Engagement"
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          value={'—'}
          subtitle={'Coming soon'}
        />
      </div>

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
            <Link href="/dashboard/create-post">
              <Button className="w-full">Create New Post</Button>
            </Link>
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
            <Link href="/dashboard/posts">
              <Button variant="outline" className="w-full bg-transparent">
                View All Posts
              </Button>
            </Link>
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
            <Link href="/dashboard/connections">
              <Button variant="outline" className="w-full bg-transparent">
                Manage Connections
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

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
                    {formatDateTime(item.createdAt as any)}
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
