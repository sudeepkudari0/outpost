'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/lib/orpc/client';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Check,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type AppKey = {
  id: string;
  name: string;
  lastFour: string;
  scopes?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date | null;
  revokedAt?: Date | null;
};

export default function ApiKeysClient(props: {
  openaiApiKey: string;
  appKeys: AppKey[];
}) {
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState(props.openaiApiKey || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    missing: string[];
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [appKeys, setAppKeys] = useState<AppKey[]>(props.appKeys || []);
  const [issuing, setIssuing] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  // BYOK local settings
  const [useUserKey, setUseUserKey] = useState<boolean>(false);
  const [provider, setProvider] = useState<'openai' | 'gemini'>('openai');
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('aiSettings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.useUserKey === 'boolean')
          setUseUserKey(parsed.useUserKey);
        if (parsed.provider === 'openai' || parsed.provider === 'gemini')
          setProvider(parsed.provider);
        if (typeof parsed.key === 'string') setUserApiKey(parsed.key);
      }
    } catch {}
  }, []);

  const reloadAppKeys = async () => {
    try {
      const data = await client.apikeys.list();
      setAppKeys(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to reload app keys:', error);
    }
  };

  const saveApiKeys = async () => {
    setSaving(true);
    try {
      const data = await client.apikeys.validateEnv();
      setValidation({ isValid: data.validation, missing: data.missing || [] });
      setSaved(true);
      toast({
        title: 'Settings Validated',
        description: data.validation
          ? 'All required environment keys are present.'
          : 'Some required environment keys are missing.',
      });
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['quota', 'status'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to validate settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const issueAppKey = async () => {
    setIssuing(true);
    try {
      const data = await client.apikeys.issue({});
      if (data.apiKey) {
        setNewKey(data.apiKey);
        toast({
          title: 'API key created',
          description: 'Copy it now; it will be hidden later.',
        });
      }
      await reloadAppKeys();
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to create API key',
        variant: 'destructive',
      });
    } finally {
      setIssuing(false);
    }
  };

  const verifyAndSaveBYOK = async () => {
    setVerifying(true);
    setVerified(null);
    try {
      const res = await client.apikeys.verifyAiKey({
        provider,
        apiKey: userApiKey,
      });
      setVerified(res.valid);
      if (res.valid) {
        localStorage.setItem(
          'aiSettings',
          JSON.stringify({ useUserKey, provider, key: userApiKey })
        );
        toast({
          title: 'Saved',
          description: 'Your AI provider settings are saved in this browser.',
        });
      } else {
        toast({
          title: 'Invalid key',
          description: res.error || 'Please check your key',
          variant: 'destructive',
        });
      }
    } catch (e: any) {
      setVerified(false);
      toast({
        title: 'Verification failed',
        description: e?.message || 'Unable to verify key',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  const revokeAppKey = async (id: string) => {
    try {
      const res = await client.apikeys.revoke({ id });
      if (!res?.success) throw new Error('Failed');
      await reloadAppKeys();
      toast({ title: 'Key revoked' });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to revoke key',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-muted-foreground">
          Manage your API keys and integrations
        </p>
      </div>

      {validation && (
        <Alert variant={validation.isValid ? 'default' : 'destructive'}>
          {validation.isValid ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {validation.isValid
              ? '✅ All API keys are configured correctly!'
              : `❌ Missing required fields: ${validation.missing.join(', ')}`}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>BYOK: Bring Your Own AI Key</CardTitle>
            <CardDescription>
              Use your own OpenAI or Gemini API key. Keys are stored only in
              this browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="use-user-key">Use my key</Label>
              <Button
                variant={useUserKey ? 'default' : 'outline'}
                onClick={() => setUseUserKey(!useUserKey)}
              >
                {useUserKey ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Provider</Label>
              <div className="flex gap-2">
                <Button
                  variant={provider === 'openai' ? 'default' : 'outline'}
                  onClick={() => setProvider('openai')}
                >
                  OpenAI
                </Button>
                <Button
                  variant={provider === 'gemini' ? 'default' : 'outline'}
                  onClick={() => setProvider('gemini')}
                >
                  Gemini
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-api-key">API Key</Label>
              <Input
                id="user-api-key"
                type="password"
                placeholder={provider === 'openai' ? 'sk-...' : 'AIza...'}
                value={userApiKey}
                onChange={e => setUserApiKey(e.target.value)}
              />
              {verified !== null && (
                <p
                  className={
                    verified ? 'text-green-600 text-sm' : 'text-red-600 text-sm'
                  }
                >
                  {verified ? 'Key verified' : 'Key invalid'}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem('aiSettings');
                  setVerified(null);
                  toast({
                    title: 'Cleared',
                    description: 'Removed saved AI settings from this browser.',
                  });
                }}
              >
                Clear
              </Button>
              <Button
                onClick={verifyAndSaveBYOK}
                disabled={!userApiKey || verifying}
              >
                {verifying ? 'Verifying...' : 'Verify & Save'}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>OpenAI Configuration</CardTitle>
            <CardDescription>
              Configure OpenAI for AI-powered content generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-api-key">OpenAI API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="openai-api-key"
                  type={showOpenAIKey ? 'text' : 'password'}
                  placeholder="Enter your OpenAI API key"
                  className="flex-1"
                  value={openaiApiKey}
                  onChange={e => setOpenaiApiKey(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                >
                  {showOpenAIKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(openaiApiKey, 'OpenAI API Key')
                  }
                  disabled={!openaiApiKey}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={saveApiKeys}
            disabled={saving || !openaiApiKey}
            className="min-w-[120px]"
          >
            {saving ? (
              'Saving...'
            ) : saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Keys
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application API Keys</CardTitle>
            <CardDescription>
              Use these keys to call your oRPC endpoints programmatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Button onClick={issueAppKey} disabled={issuing}>
                {issuing ? 'Creating...' : 'Create API Key'}
              </Button>
              {newKey && (
                <div className="flex-1 flex items-center gap-2">
                  <Input readOnly value={newKey} />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(newKey, 'API Key')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {appKeys.length === 0 ? (
                <p className="text-sm text-muted-foreground">No keys yet.</p>
              ) : (
                appKeys.map(k => (
                  <div
                    key={k.id}
                    className="flex items-center justify-between border rounded p-3"
                  >
                    <div>
                      <div className="font-medium">{k.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ••••{k.lastFour}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {k.revokedAt ? (
                        <span className="text-xs text-muted-foreground">
                          revoked
                        </span>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={() => revokeAppKey(k.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
