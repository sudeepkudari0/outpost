'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { client } from '@/lib/orpc/client';
import type { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export type MemberShare = {
  profileId: string;
  profileName: string;
  memberUserId: string;
  memberEmail: string | null;
  memberName: string | null;
  scopes: string[];
  createdAt: Date | string;
};

export type MyAccess = {
  profileId: string;
  profileName: string;
  ownerUserId: string;
  ownerEmail: string | null;
  ownerName: string | null;
  scopes: string[];
  createdAt: Date | string;
};

export const createMembersColumns = (
  onRefresh?: () => void
): ColumnDef<MemberShare>[] => [
  {
    id: 'member',
    header: 'Member',
    minSize: 200,
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {member.memberName || member.memberEmail || 'Member'}
          </span>
          {member.memberName && member.memberEmail && (
            <span className="text-xs text-muted-foreground">
              {member.memberEmail}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: 'profile',
    header: 'Profile',
    minSize: 180,
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.profileName}</Badge>
    ),
  },
  {
    id: 'scopes',
    header: 'Permissions',
    minSize: 150,
    cell: ({ row }) => {
      const scopes = row.original.scopes || [];
      return (
        <div className="flex flex-wrap gap-1">
          {scopes.map((scope, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {scope}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Added',
    size: 140,
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-xs">
          <div>{date.toLocaleDateString()}</div>
          <div className="text-muted-foreground">
            {date.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 120,
    cell: ({ row }) => (
      <RemoveMemberAction share={row.original} onRefresh={onRefresh} />
    ),
  },
];

function RemoveMemberAction({
  share,
  onRefresh,
}: {
  share: MemberShare;
  onRefresh?: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      await client.team.revokeShare({
        profileId: share.profileId,
        memberUserId: share.memberUserId,
      });
      toast({
        title: 'Member removed',
        description: 'Access has been revoked successfully',
      });
      setDeleteOpen(false);
      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to remove member',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" title="Remove member">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove access for{' '}
            <strong>
              {share.memberName || share.memberEmail || 'this member'}
            </strong>{' '}
            from the profile <strong>{share.profileName}</strong>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isLoading}
          >
            {isLoading ? 'Removing...' : 'Remove'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const createMyAccessColumns = (): ColumnDef<MyAccess>[] => [
  {
    id: 'profile',
    header: 'Profile',
    minSize: 200,
    cell: ({ row }) => (
      <div className="font-medium">{row.original.profileName}</div>
    ),
  },
  {
    id: 'owner',
    header: 'Owner',
    minSize: 200,
    cell: ({ row }) => {
      const access = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {access.ownerName || access.ownerEmail || 'Owner'}
          </span>
          {access.ownerName && access.ownerEmail && (
            <span className="text-xs text-muted-foreground">
              {access.ownerEmail}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: 'scopes',
    header: 'Permissions',
    minSize: 150,
    cell: ({ row }) => {
      const scopes = row.original.scopes || [];
      return (
        <div className="flex flex-wrap gap-1">
          {scopes.map((scope, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {scope}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Granted',
    size: 140,
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-xs">
          <div>{date.toLocaleDateString()}</div>
          <div className="text-muted-foreground">
            {date.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      );
    },
  },
];
