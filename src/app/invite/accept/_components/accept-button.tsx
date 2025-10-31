'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { client } from '@/lib/orpc/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AcceptButton({ token }: { token: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function accept() {
    setLoading(true);
    try {
      await client.invites.acceptInvite({ token });
      toast({ title: 'Invite accepted' });
      router.replace('/dashboard');
    } catch (e: any) {
      toast({
        title: 'Failed to accept invite',
        description: e?.message || 'Try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={accept} disabled={loading}>
      {loading ? 'Accepting...' : 'Accept Invite'}
    </Button>
  );
}
