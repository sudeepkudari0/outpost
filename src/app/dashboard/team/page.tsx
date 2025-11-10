import { client } from '@/lib/orpc/server';
import TeamComponent from './_components/team-component';

async function getData() {
  const [profiles, sharesDetailed, myAccess, teamInvites] = await Promise.all([
    client.social['get-profiles'](),
    client.team.listSharesDetailed(),
    client.team.listMyAccess(),
    client.invites.listTeamInvites(),
  ]);
  return { profiles, sharesDetailed, myAccess, teamInvites };
}

export default async function TeamPage() {
  const { profiles, sharesDetailed, myAccess, teamInvites } = await getData();

  return (
    <TeamComponent
      profiles={profiles}
      sharesDetailed={sharesDetailed}
      myAccess={myAccess}
      teamInvites={teamInvites || []}
    />
  );
}
