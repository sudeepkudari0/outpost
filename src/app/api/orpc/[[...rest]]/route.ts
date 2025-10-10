import { router } from '@/lib/orpc/router';
import { onError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { BatchHandlerPlugin } from '@orpc/server/plugins';

const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((error: any) => {
      console.error('=== ORPC ERROR DETAILS ===');
      console.error('Error type:', error.constructor?.name || 'Unknown');
      console.error('Error code:', error.code);
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);
      if (error.data) {
        console.error('Error data:', JSON.stringify(error.data, null, 2));
      }
      if (error.cause) {
        console.error('Error cause:', error.cause);
        if (error.cause.issues && Array.isArray(error.cause.issues)) {
          console.error('Validation issues:');
          error.cause.issues.forEach((issue: any, index: number) => {
            console.error(`  Issue ${index + 1}:`, {
              path: issue.path?.join('.') || 'root',
              code: issue.code,
              message: issue.message,
              expected: issue.expected,
              received: issue.received,
              ...issue,
            });
          });
        }
      }
      console.error(
        'Full error object:',
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      );
      console.error('=== END ORPC ERROR DETAILS ===');
    }),
  ],
  plugins: [new BatchHandlerPlugin()],
});

async function handleRequest(request: Request) {
  const { response } = await rpcHandler.handle(request, {
    prefix: '/api/orpc',
    context: {},
  });
  return response ?? new Response('Not found', { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
