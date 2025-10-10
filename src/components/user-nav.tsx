'use client';

import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';

export function UserNav() {
  const { data } = useSession();
  const user = data?.user;

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <span className="text-sm text-muted-foreground">
            {user.name || user.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Sign out
          </Button>
        </>
      ) : null}
    </div>
  );
}
