import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { router } from '@/lib/orpc/router';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { onError } from '@orpc/server';
import { ZodSmartCoercionPlugin, ZodToJsonSchemaConverter } from '@orpc/zod';
import '../polyfill';

const openAPIHandler = new OpenAPIHandler(router, {
  interceptors: [
    onError(error => {
      console.error(error);
    }),
  ],
  plugins: [
    new ZodSmartCoercionPlugin(),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: 'Tr OpenAccess API',
          version: '1.0.0',
        },
        commonSchemas: {},
        security: [{ bearerAuth: [] }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
            },
          },
        },
      },
      docsConfig: {
        authentication: {
          securitySchemes: {
            bearerAuth: {
              token: 'default-token',
            },
          },
        },
      },
    }),
  ],
});

async function handleRequest(request: Request) {
  const session = await auth();
  const dbUser = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : undefined;
  const { response } = await openAPIHandler.handle(request, {
    prefix: '/api/openapi',
    context: {
      prisma: prisma,
      user: dbUser ?? undefined,
    },
  });

  return response ?? new Response('Not found', { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
