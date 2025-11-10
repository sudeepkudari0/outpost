'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { client } from '@/lib/orpc/client';
import { SubscriptionTier } from '@prisma/client';
import type { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  image?: string | null;
  createdAt: Date;
  subscription?: {
    tier: string;
    status: string;
    currentPeriodEnd: Date | null;
  } | null;
  usage?: {
    postsToday: number;
    postsThisMonth: number;
    profileCount: number;
  } | null;
};

const formatEnum = (v?: string | null) =>
  v
    ? v
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase())
    : '-';

export const usersColumns: ColumnDef<AdminUser>[] = [
  {
    id: 'user',
    header: 'User',
    minSize: 240,
    cell: ({ row }) => {
      const u = row.original;
      const initials = (u.name || u.email)
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={u.image || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{u.name || '—'}</span>
            <span className="text-xs text-muted-foreground">{u.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: 'role',
    header: 'Role',
    size: 100,
    cell: ({ row }) => <Badge variant="outline">{row.original.role}</Badge>,
  },
  {
    id: 'status',
    header: 'Status',
    size: 110,
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === 'ACTIVE' ? 'default' : 'secondary'}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: 'plan',
    header: 'Plan',
    minSize: 140,
    cell: ({ row }) => (
      <div className="flex flex-col text-xs">
        <span className="font-medium">
          {row.original.subscription?.tier || 'FREE'}
        </span>
        <span className="text-muted-foreground">
          {formatEnum(row.original.subscription?.status) || 'Active'}
        </span>
      </div>
    ),
  },
  {
    id: 'usage',
    header: 'Usage',
    minSize: 180,
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        <div>Profiles: {row.original.usage?.profileCount ?? 0}</div>
        <div>Today: {row.original.usage?.postsToday ?? 0}</div>
        <div>Month: {row.original.usage?.postsThisMonth ?? 0}</div>
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    size: 140,
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 180,
    cell: ({ row }) => {
      const u = row.original;
      return <RowActions user={u} />;
    },
  },
];

function RowActions({ user }: { user: AdminUser }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [tier, setTier] = useState<string | undefined>(
    user.subscription?.tier || undefined
  );
  const [loading, setLoading] = useState(false);

  async function saveEdit() {
    setLoading(true);
    try {
      await client.admin.updateUser({
        userId: user.id,
        name: name || undefined,
        planTier: tier as SubscriptionTier,
      });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  async function disableUser() {
    setLoading(true);
    try {
      await client.admin.disableUser({ userId: user.id });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser() {
    setLoading(true);
    try {
      await client.admin.deleteUser({ userId: user.id });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="ENTERPRISE">
                    Enterprise (Unlimited)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={saveEdit} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable or Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>Choose an action for this user:</p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={disableUser}
                disabled={loading}
              >
                {loading ? 'Working...' : 'Disable'}
              </Button>
              <Button
                variant="destructive"
                onClick={deleteUser}
                disabled={loading}
              >
                {loading ? 'Working...' : 'Delete Completely'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
