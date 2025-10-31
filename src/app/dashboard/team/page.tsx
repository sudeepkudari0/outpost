import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { client } from '@/lib/orpc/server';
import { Suspense } from 'react';
import { InviteClient } from './_components/invite-client';

async function getData() {
  const [profiles, sharesDetailed, myAccess] = await Promise.all([
    client.social['get-profiles'](),
    client.team.listSharesDetailed(),
    client.team.listMyAccess(),
  ]);
  return { profiles, sharesDetailed, myAccess } as any;
}

export default async function TeamPage() {
  const { profiles, sharesDetailed, myAccess } = await getData();

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground">
            Manage who can post to your profiles
          </p>
        </div>
        <InviteButton profiles={profiles} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sharesDetailed.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members yet.</p>
              ) : (
                sharesDetailed.map((s: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border rounded-md p-3"
                  >
                    <div>
                      <div className="font-medium">
                        {s.memberName || s.memberEmail || 'Member'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Access to: {s.profileName}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myAccess.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You don't have access to other profiles.
                </p>
              ) : (
                myAccess.map((a: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border rounded-md p-3"
                  >
                    <div>
                      <div className="font-medium">{a.profileName}</div>
                      <div className="text-sm text-muted-foreground">
                        Owner: {a.ownerName || a.ownerEmail || a.ownerUserId}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InviteButton({
  profiles,
}: {
  profiles: Array<{ id: string; name: string }>;
}) {
  // Client subcomponent to handle invite action
  return (
    <Suspense>
      {/* Client boundary */}
      <InviteClient profiles={profiles} />
    </Suspense>
  );
}
