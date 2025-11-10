'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { client } from '@/lib/orpc/client';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { createInvitesColumns, type PlatformInvite } from './invites-columns';
import { usersColumns, type AdminUser } from './users-columns';

export default function UsersComponent({
  users,
  invites,
}: {
  users: any[];
  invites: any[];
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<string | undefined>(undefined);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitesList, setInvitesList] = useState<any[]>(invites);
  const { toast } = useToast();

  async function handleInvite() {
    if (!email || !tier) {
      toast({
        title: 'Missing info',
        description: 'Enter email and select a tier',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await client.invites.createPlatformInvite({
        email,
        planTier: tier as any,
        expiresInDays: 7,
      });
      // Send email with magic link
      await client.invites.sendInviteEmail({
        email,
        name: email.split('@')[0],
        inviteUrl: res.inviteUrl,
      });
      setInviteUrl(res.inviteUrl);
      toast({
        title: 'Invite sent',
        description: 'Email sent successfully.',
      });
      setOpen(false);
      setEmail('');
      setTier(undefined);
      setInviteUrl(null);
      // Refresh invites list
      const updatedInvites = await client.invites.listPlatformInvites();
      setInvitesList(updatedInvites || []);
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to create invite',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="">
      <Tabs defaultValue="users" className="w-full">
        <Card>
          <CardContent className="pt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="invites">Invites</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-0">
              <DataTable<AdminUser, unknown>
                columns={usersColumns}
                data={users as AdminUser[]}
                actions={
                  <Button onClick={() => setOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" /> Invite User
                  </Button>
                }
              />
            </TabsContent>

            <TabsContent value="invites" className="mt-0">
              <DataTable<PlatformInvite, unknown>
                columns={createInvitesColumns(async () => {
                  const updatedInvites =
                    await client.invites.listPlatformInvites();
                  setInvitesList(updatedInvites || []);
                })}
                data={invitesList as PlatformInvite[]}
                actions={
                  <Button onClick={() => setOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" /> Invite User
                  </Button>
                }
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {open && (
        <div className="flex items-center justify-between">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
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
                        Completely free (Unlimited)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleInvite} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Invite'}
                  </Button>
                  {inviteUrl ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(inviteUrl || '');
                        toast({ title: 'Copied link to clipboard' });
                      }}
                    >
                      Copy Link
                    </Button>
                  ) : null}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
