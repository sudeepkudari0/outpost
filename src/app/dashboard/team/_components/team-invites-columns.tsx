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
import { Copy, Mail, Trash2 } from 'lucide-react';
import { useState } from 'react';

export type TeamInvite = {
  id: string;
  email: string;
  inviter: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  profileIds: string[];
  profileNames: string[];
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function getInviteStatus(invite: TeamInvite): {
  status: 'pending' | 'accepted' | 'expired';
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  if (invite.acceptedAt) {
    return {
      status: 'accepted',
      label: 'Accepted',
      variant: 'default',
    };
  }

  const now = new Date();
  const expiresAt = new Date(invite.expiresAt);
  if (expiresAt < now) {
    return {
      status: 'expired',
      label: 'Expired',
      variant: 'destructive',
    };
  }

  return {
    status: 'pending',
    label: 'Pending',
    variant: 'secondary',
  };
}

export const createTeamInvitesColumns = (
  onRefresh?: () => void
): ColumnDef<TeamInvite>[] => [
  {
    id: 'email',
    header: 'Email',
    minSize: 200,
    cell: ({ row }) => <div className="font-medium">{row.original.email}</div>,
  },
  {
    id: 'profiles',
    header: 'Profiles',
    minSize: 200,
    cell: ({ row }) => {
      const profileNames = row.original.profileNames;
      if (profileNames.length === 0) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {profileNames.map((name, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: 'status',
    header: 'Status',
    size: 130,
    cell: ({ row }) => {
      const statusInfo = getInviteStatus(row.original);
      return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
    },
  },
  {
    id: 'expiresAt',
    header: 'Expires',
    size: 140,
    cell: ({ row }) => {
      const expiresAt = new Date(row.original.expiresAt);
      const now = new Date();
      const isExpired = expiresAt < now;
      return (
        <div className="text-xs">
          <div className={isExpired ? 'text-destructive' : ''}>
            {expiresAt.toLocaleDateString()}
          </div>
          <div className="text-muted-foreground">
            {expiresAt.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      );
    },
  },
  {
    id: 'acceptedAt',
    header: 'Accepted',
    size: 140,
    cell: ({ row }) => {
      const acceptedAt = row.original.acceptedAt;
      if (!acceptedAt) return <span className="text-muted-foreground">—</span>;
      const date = new Date(acceptedAt);
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
    accessorKey: 'createdAt',
    header: 'Created',
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
    size: 200,
    cell: ({ row }) => (
      <TeamInviteActions invite={row.original} onRefresh={onRefresh} />
    ),
  },
];

function TeamInviteActions({
  invite,
  onRefresh,
}: {
  invite: TeamInvite;
  onRefresh?: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const statusInfo = getInviteStatus(invite);
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000';
  const inviteUrl = `${baseUrl}/invite/accept?token=${encodeURIComponent(invite.token)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: 'Link copied',
      description: 'Invite link has been copied to clipboard',
    });
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      await client.invites.resendInviteEmail({ inviteId: invite.id });
      toast({
        title: 'Email sent',
        description: `Invite email has been sent to ${invite.email}`,
      });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to send email',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await client.invites.deleteInvite({ inviteId: invite.id });
      toast({
        title: 'Invite deleted',
        description: 'The invite has been deleted successfully',
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
        description: e?.message || 'Failed to delete invite',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled =
    statusInfo.status === 'accepted' || statusInfo.status === 'expired';

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        disabled={isDisabled}
        title="Copy invite link"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleResendEmail}
        disabled={isDisabled || isLoading}
        title="Resend invite email"
      >
        <Mail className="h-4 w-4" />
      </Button>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            disabled={isLoading}
            title="Delete invite"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invite</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the invite for{' '}
              <strong>{invite.email}</strong>? This action cannot be undone.
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
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
