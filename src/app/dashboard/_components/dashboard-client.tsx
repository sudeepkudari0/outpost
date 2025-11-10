'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  Calendar,
  Clock,
  Crown,
  FileText,
  LinkIcon,
  Users,
} from 'lucide-react';
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
  const d = new Date(input);
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
  quota,
}: {
  posts: PostItem[];
  accounts: AccountItem[];
  quota?: any;
}) {
  function MetricCard({
    title,
    value,
    icon: Icon,
    color,
    trend,
    subtitle,
  }: {
    title: string;
    value: number | string | ReactNode;
    icon: any;
    color: 'blue' | 'green' | 'purple' | 'indigo' | 'cyan' | 'emerald';
    trend?: string;
    subtitle?: ReactNode;
  }) {
    const colorClasses: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      indigo: 'from-indigo-500 to-indigo-600',
      cyan: 'from-cyan-500 to-cyan-600',
      emerald: 'from-emerald-500 to-emerald-600',
    };

    return (
      <div className="border-slate-200 rounded-lg p-3 border dark:border-slate-800 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div
            className={`w-8 h-8 bg-gradient-to-br ${colorClasses[color]} rounded-md flex items-center justify-center shadow-sm`}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
          {trend && (
            <span className="text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
              {trend}
            </span>
          )}
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {typeof value === 'number'
              ? (value as number).toLocaleString()
              : value}
          </p>
          {subtitle ? (
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const totalPosts = posts.length;

  const scheduledPosts = posts.filter(
    p => (p.status || '').toLowerCase() === 'scheduled'
  );
  const scheduledCount = scheduledPosts.length;
  const upcoming = scheduledPosts
    .map(p => toDate(p.scheduledFor))
    .filter((d): d is Date => !!d && d.getTime() >= Date.now())
    .sort((a, b) => a.getTime() - b.getTime());
  const nextScheduled = upcoming[0] ? upcoming[0].toISOString() : null;

  const connectedAccounts = accounts.length;
  const uniquePlatforms = new Set(
    accounts.map(a => a.platform).filter(x => !!x)
  );

  const recentActivity = posts
    .map(p => ({
      id: p.id,
      status: p.status,
      platform: Array.isArray(p.platforms)
        ? p.platforms.map((x: any) =>
            typeof x === 'string' ? x : x.platform
          )[0]
        : undefined,
      createdAt: p.createdAt || p.scheduledFor,
      content: p.content,
    }))
    .sort((a, b) => {
      const ad = new Date(a.createdAt || 0).getTime();
      const bd = new Date(b.createdAt || 0).getTime();
      return bd - ad;
    })
    .slice(0, 3);

  const postsMonthlyUsed = quota?.posts?.monthly?.used as number | undefined;
  const postsMonthlyLimit = quota?.posts?.monthly?.limit as number | undefined;
  const tier = quota?.tier as string | undefined;
  const postsDailyUsed = quota?.posts?.daily?.used as number | undefined;
  const postsDailyLimit = quota?.posts?.daily?.limit as number | undefined;

  return (
    <div className="pr-2 space-y-6">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 lg:gap-3">
        <MetricCard
          title="Posts"
          value={totalPosts}
          icon={FileText}
          color="purple"
        />
        <MetricCard
          title="Scheduled"
          value={scheduledCount}
          icon={Clock}
          color="blue"
          subtitle={`Next: ${formatDateTime(nextScheduled)}`}
        />
        <MetricCard
          title="Connected"
          value={connectedAccounts}
          icon={LinkIcon}
          color="cyan"
          subtitle={`Across ${uniquePlatforms.size} platform${
            uniquePlatforms.size === 1 ? '' : 's'
          }`}
        />
        <MetricCard
          title="Posts (30d)"
          value={
            typeof postsMonthlyUsed === 'number' &&
            typeof postsMonthlyLimit === 'number'
              ? `${postsMonthlyUsed}/${postsMonthlyLimit === -1 ? '∞' : postsMonthlyLimit}`
              : '—'
          }
          icon={FileText}
          color="emerald"
          subtitle={tier ? `Tier: ${tier}` : undefined}
        />
        <MetricCard
          title="Current Plan"
          value={tier || 'FREE'}
          icon={Crown}
          color="indigo"
          subtitle={
            typeof postsMonthlyLimit === 'number'
              ? `Monthly posts: ${postsMonthlyLimit === -1 ? '∞' : postsMonthlyLimit}`
              : undefined
          }
        />
        <MetricCard
          title="Posts (Today)"
          value={
            typeof postsDailyUsed === 'number' &&
            typeof postsDailyLimit === 'number'
              ? `${postsDailyUsed}/${postsDailyLimit === -1 ? '∞' : postsDailyLimit}`
              : typeof postsDailyUsed === 'number'
                ? postsDailyUsed
                : '—'
          }
          icon={Activity}
          color="green"
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
                    {formatDateTime(item.createdAt as string | null)}
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
