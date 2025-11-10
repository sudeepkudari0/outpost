import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { prisma } from '@/lib/db';
import { AlertCircle, CheckCircle2, Crown, Users } from 'lucide-react';
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
        if (!invite) return { exists: false };
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
            where: { id: { in: invite.profileIds } },
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
        };
      })()
    : { exists: false };

  const callback = encodeURIComponent(`/invite/accept?token=${token}`);

  if (!token || !details.exists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="max-w-md w-full border-slate-200 dark:border-slate-800 shadow-xl">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Invalid Invite
            </h1>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              This invitation link is invalid or has expired. Please request a
              new invitation.
            </p>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (details.expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="max-w-md w-full border-slate-200 dark:border-slate-800 shadow-xl">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Invite Expired
            </h1>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              This invitation has expired. Please contact the person who invited
              you for a new link.
            </p>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const inviterName = details.inviter?.name || details.inviter?.email || 'User';
  const isTeamInvite = details.kind === 'TEAM';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="max-w-lg w-full border-slate-200 dark:border-slate-800 shadow-xl">
        <CardHeader className="text-center pb-3 space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            {isTeamInvite ? (
              <Users className="w-10 h-10 text-white" />
            ) : (
              <Crown className="w-10 h-10 text-white" />
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {isTeamInvite ? 'Team Invitation' : 'Plan Activation'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {inviterName}
              </span>{' '}
              has invited you
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                  {isTeamInvite
                    ? `Join ${inviterName}'s team`
                    : `Activate ${details.planTier || 'FREE'} plan`}
                </p>
                {details.email && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Invited email: {details.email}
                  </p>
                )}
              </div>
            </div>

            {isTeamInvite && details.teamProfiles?.length ? (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Profiles included ({details.teamProfiles.length}):
                </p>
                <div className="space-y-1.5">
                  {details.teamProfiles.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Authentication Section */}
          {session?.user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-900 dark:text-green-100">
                  Signed in as{' '}
                  <span className="font-semibold">{session.user.email}</span>
                </p>
              </div>
              <AcceptButton token={token} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Please sign in or create an account to accept this invitation
                </p>
              </div>
              <div className="flex items-center gap-2 w-full">
                <Link
                  href={`/login?callbackUrl=${callback}`}
                  className="block w-full"
                >
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    Sign in
                  </Button>
                </Link>
                <Link
                  href={`/signup?callbackUrl=${callback}`}
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full">
                    Create account
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
