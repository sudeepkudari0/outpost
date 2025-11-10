'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { client } from '@/lib/orpc/client';
import { useState } from 'react';
import { InviteClient } from './invite-client';
import {
  createMembersColumns,
  createMyAccessColumns,
  type MemberShare,
  type MyAccess,
} from './members-columns';
import {
  createTeamInvitesColumns,
  type TeamInvite,
} from './team-invites-columns';

export default function TeamComponent({
  profiles,
  sharesDetailed: initialShares,
  myAccess: initialMyAccess,
  teamInvites: initialInvites,
}: {
  profiles: Array<{ id: string; name: string }>;
  sharesDetailed: any[];
  myAccess: any[];
  teamInvites: any[];
}) {
  const [invitesList, setInvitesList] = useState<any[]>(initialInvites);
  const [sharesList, setSharesList] = useState<any[]>(initialShares);
  const { toast } = useToast();

  const refreshInvites = async () => {
    try {
      const updatedInvites = await client.invites.listTeamInvites();
      setInvitesList(updatedInvites || []);
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to refresh invites',
        variant: 'destructive',
      });
    }
  };

  const refreshShares = async () => {
    try {
      const updatedShares = await client.team.listSharesDetailed();
      setSharesList(updatedShares || []);
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to refresh members',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="invites" className="w-full">
        <Card>
          <CardContent>
            <TabsList className="mb-4">
              <TabsTrigger
                value="invites"
                className="data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:text-white"
              >
                Team Invites
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:text-white"
              >
                Your Members
              </TabsTrigger>
              <TabsTrigger
                value="access"
                className="data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:text-white"
              >
                My Access
              </TabsTrigger>
            </TabsList>

            <TabsContent value="invites" className="mt-0">
              <DataTable<TeamInvite, unknown>
                columns={createTeamInvitesColumns(refreshInvites)}
                data={invitesList as TeamInvite[]}
                actions={
                  <InviteClient
                    profiles={profiles}
                    onInviteSuccess={refreshInvites}
                  />
                }
              />
            </TabsContent>

            <TabsContent value="members" className="mt-0">
              <DataTable<MemberShare, unknown>
                columns={createMembersColumns(refreshShares)}
                data={sharesList as MemberShare[]}
                actions={
                  <InviteClient
                    profiles={profiles}
                    onInviteSuccess={refreshInvites}
                  />
                }
              />
            </TabsContent>

            <TabsContent value="access" className="mt-0">
              <DataTable<MyAccess, unknown>
                columns={createMyAccessColumns()}
                data={initialMyAccess as MyAccess[]}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
