import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { AcceptButton } from './_components/accept-button';

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params?.token ?? '';
  const session = await auth();
  const details = token
    ? await (async () => {
        const invite = await prisma.invite.findUnique({ where: { token } });
        if (!invite) return { exists: false } as any;
        const expired = invite.expiresAt < new Date();
        const inviter = await prisma.user.findUnique({
          where: { id: invite.inviterId },
          select: { id: true, name: true, email: true },
        });
        let teamProfiles: Array<{ id: string; name: string }> | undefined;
        if (
          invite.kind === 'TEAM' &&
          Array.isArray(invite.profileIds) &&
          invite.profileIds.length
        ) {
          const profiles = await prisma.socialProfile.findMany({
            where: { id: { in: invite.profileIds as any } },
            select: { id: true, name: true },
          });
          teamProfiles = profiles;
        }
        return {
          exists: true,
          kind: invite.kind,
          email: invite.email,
          inviter,
          teamProfiles,
          planTier: invite.planTier ?? undefined,
          expired,
        } as any;
      })()
    : ({ exists: false } as any);

  const callback = encodeURIComponent(`/invite/accept?token=${token}`);

  if (!token || !details.exists) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-xl w-full">
          <CardHeader>
            <CardTitle>Invalid Invite</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This invite is invalid or missing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const inviterName = details.inviter?.name || details.inviter?.email || 'User';
  const teamLabel =
    details.kind === 'TEAM'
      ? `You are about to join ${inviterName}'s team`
      : `You are about to activate a ${details.planTier || 'FREE'} plan`;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">{teamLabel}</p>

            {details.kind === 'TEAM' && details.teamProfiles?.length ? (
              <div className="text-sm">
                <div className="font-medium mb-1">Profiles included:</div>
                <ul className="list-disc pl-5">
                  {details.teamProfiles.map((p: any) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {session?.user ? (
              <>
                <div className="text-sm text-muted-foreground">
                  Signed in as{' '}
                  <span className="font-medium">{session.user.email}</span>
                </div>
                {/* Client accept button */}
                <AcceptButton token={token} />
              </>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Please sign in or create an account to continue.
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/login?callbackUrl=${callback}`}>
                    <Button>Sign in</Button>
                  </Link>
                  <Link href={`/signup?callbackUrl=${callback}`}>
                    <Button variant="secondary">Create account</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
