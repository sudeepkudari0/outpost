'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Activity,
  Crown,
  FileText,
  LinkIcon,
  TrendingUp,
  UserCheck,
  UserCircle,
  Users,
} from 'lucide-react';

type AdminStats = {
  totals: {
    users: number;
    activeUsers: number;
    profiles: number;
    connectedAccounts: number;
    posts: number;
  };
  newUsers: { last7Days: number; last30Days: number };
  subscriptions: {
    byTier: Array<{ tier: string; _count: number }>;
    byStatus: Array<{ status: string; _count: number }>;
  };
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    createdAt: string | Date;
    subscription?: { tier: string; status: string } | null;
  }>;
  timeseries: { usersLast30Days: Array<{ date: string; count: number }> };
};

export default function AdminDashboard({ stats }: { stats: AdminStats }) {
  const tierCounts = Object.fromEntries(
    stats.subscriptions.byTier.map((t: any) => [t.tier, t._count])
  );
  const statusCounts = Object.fromEntries(
    stats.subscriptions.byStatus.map((s: any) => [s.status, s._count])
  );

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Compact Stats Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 lg:gap-3">
        <MetricCard
          title="Users"
          value={stats.totals.users}
          icon={Users}
          trend={`+${stats.newUsers.last7Days}`}
          color="blue"
        />
        <MetricCard
          title="Active"
          value={stats.totals.activeUsers}
          icon={UserCheck}
          color="green"
        />
        <MetricCard
          title="Posts"
          value={stats.totals.posts}
          icon={FileText}
          color="purple"
        />
        <MetricCard
          title="Profiles"
          value={stats.totals.profiles}
          icon={UserCircle}
          color="indigo"
        />
        <MetricCard
          title="Connected"
          value={stats.totals.connectedAccounts}
          icon={LinkIcon}
          color="cyan"
        />
        <MetricCard
          title="New (30d)"
          value={stats.newUsers.last30Days}
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Compact Subscriptions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-600 rounded-md flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 text-white" />
              </div>
              <CardTitle className="text-sm font-semibold">
                Subscription Tiers
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                { tier: 'FREE', color: 'bg-slate-500' },
                { tier: 'PRO', color: 'bg-blue-500' },
                { tier: 'BUSINESS', color: 'bg-purple-500' },
                { tier: 'ENTERPRISE', color: 'bg-amber-500' },
              ].map(({ tier, color }) => (
                <div
                  key={tier}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900/30"
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {tier}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {tierCounts[tier] || 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-white" />
              </div>
              <CardTitle className="text-sm font-semibold">
                Subscription Status
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                { status: 'ACTIVE', color: 'bg-green-500', label: 'Active' },
                { status: 'TRIALING', color: 'bg-blue-500', label: 'Trial' },
                {
                  status: 'PAST_DUE',
                  color: 'bg-orange-500',
                  label: 'Past Due',
                },
                { status: 'CANCELED', color: 'bg-red-500', label: 'Canceled' },
              ].map(({ status, color, label }) => (
                <div
                  key={status}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900/30"
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {statusCounts[status] || 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compact Recent Users Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            <CardTitle className="text-sm font-semibold">
              Recent Users
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="overflow-x-auto -mx-4 px-4">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400 h-8">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400 h-8">
                    Email
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400 h-8">
                    Tier
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400 h-8">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400 h-8">
                    Joined
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentUsers.map(u => (
                  <TableRow
                    key={u.id}
                    className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100 text-xs py-2">
                      {u.name || (
                        <span className="text-slate-400 dark:text-slate-600">
                          No name
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400 py-2">
                      {u.email}
                    </TableCell>
                    <TableCell className="py-2">
                      <TierBadge tier={u.subscription?.tier} />
                    </TableCell>
                    <TableCell className="py-2">
                      <StatusBadge status={u.subscription?.status} />
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400 py-2">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: number | string;
  icon: any;
  trend?: string;
  color: string;
}) {
  const colorClasses = {
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
          className={`w-8 h-8 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-md flex items-center justify-center shadow-sm`}
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
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier?: string }) {
  if (!tier) {
    return (
      <span className="text-xs text-slate-400 dark:text-slate-600">-</span>
    );
  }

  const colors = {
    FREE: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    PRO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    BUSINESS:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    ENTERPRISE:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${colors[tier as keyof typeof colors] || colors.FREE}`}
    >
      {tier}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) {
    return (
      <span className="text-xs text-slate-400 dark:text-slate-600">-</span>
    );
  }

  const colors = {
    ACTIVE:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    TRIALING:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    PAST_DUE:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    CANCELED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    INACTIVE:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  const labels = {
    ACTIVE: 'Active',
    TRIALING: 'Trial',
    PAST_DUE: 'Past Due',
    CANCELED: 'Canceled',
    INACTIVE: 'Inactive',
  };

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${colors[status as keyof typeof colors] || colors.INACTIVE}`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
