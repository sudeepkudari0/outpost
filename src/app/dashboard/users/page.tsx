import { client } from '@/lib/orpc/server';
import UsersComponent from './_components/users-component';

async function UsersPage() {
  const [users, invites] = await Promise.all([
    client.admin.listUsers(),
    client.invites.listPlatformInvites(),
  ]);

  return <UsersComponent users={users || []} invites={invites || []} />;
}

export default UsersPage;
