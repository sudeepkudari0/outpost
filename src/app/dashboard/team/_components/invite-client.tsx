'use client';

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
import { useToast } from '@/components/ui/use-toast';
import { client } from '@/lib/orpc/client';
import { useState } from 'react';

export function InviteClient({
  profiles,
  onInviteSuccess,
}: {
  profiles: Array<{ id: string; name: string }>;
  onInviteSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [profileId, setProfileId] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  async function onInvite() {
    if (!email || !profileId) {
      toast({
        title: 'Missing info',
        description: 'Enter email and select a profile',
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await client.team.shareProfiles({
        email,
        profileIds: [profileId],
      });
      if (res.inviteUrl) {
        try {
          await client.invites.sendTeamEmail({
            email,
            inviterName: 'Team Member',
            inviteUrl: res.inviteUrl,
          });
          toast({
            title: 'Invite sent',
            description: 'Email sent successfully.',
          });
        } catch {
          await navigator.clipboard.writeText(res.inviteUrl);
          toast({
            title: 'Invite created',
            description: 'Invite link copied to clipboard',
          });
        }
      } else {
        toast({ title: 'Member added' });
      }
      setOpen(false);
      setEmail('');
      setProfileId(undefined);
      if (onInviteSuccess) {
        onInviteSuccess();
      }
    } catch (e: any) {
      toast({
        title: 'Failed to invite',
        description: e?.message || 'Try again',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite to Team</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to Team</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="teammate@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Profile</Label>
            <Select value={profileId} onValueChange={setProfileId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a profile" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button onClick={onInvite} disabled={submitting}>
              {submitting ? 'Inviting...' : 'Invite'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
