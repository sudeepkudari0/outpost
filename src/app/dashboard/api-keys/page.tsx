import { client } from '@/lib/orpc/server';
import ApiKeysClient from './_components/api-keys-client';

export default async function ApiKeysPage() {
  const appKeys = await client.apikeys.list();
  const openaiApiKey = process.env.OPENAI_API_KEY || '';

  return <ApiKeysClient openaiApiKey={openaiApiKey} appKeys={appKeys} />;
}
