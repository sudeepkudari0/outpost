import { client } from '@/lib/orpc/server';
import UsersComponent from './_components/users-component';

async function UsersPage() {
  const users = await client.admin.listUsers();

  return <UsersComponent users={users || []} />;
}

export default UsersPage;
