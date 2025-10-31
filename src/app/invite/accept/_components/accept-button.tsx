'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { client } from '@/lib/orpc/client';
import { CheckCircle2, Loader2 } from 'lucide-react';
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
      toast({
        title: 'Invitation accepted!',
        description: 'Redirecting to your dashboard...',
      });
      router.replace('/dashboard');
    } catch (e: any) {
      toast({
        title: 'Failed to accept invite',
        description: e?.message || 'Please try again',
        variant: 'destructive',
      });
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={accept}
      disabled={loading}
      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Accepting invitation...
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Accept Invitation
        </>
      )}
    </Button>
  );
}
