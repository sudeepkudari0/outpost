'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/lib/orpc/client';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

type ValidationState = {
  isValid: boolean;
  missing: string[];
};

type ProviderVerification = {
  openai: boolean | null;
  gemini: boolean | null;
};

const STORAGE_KEY = 'aiSettings';

export default function ApiKeysClient(props: {
  openaiApiKey: string;
  appKeys: AppKey[];
}) {
  // App keys state
  const [appKeys, setAppKeys] = useState<AppKey[]>(props.appKeys || []);
  const [issuing, setIssuing] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [revokeDialog, setRevokeDialog] = useState<{
    open: boolean;
    key: AppKey | null;
  }>({ open: false, key: null });

  // Validation state
  const [validation, setValidation] = useState<ValidationState | null>(null);
  const [validating, setValidating] = useState(false);

  // BYOK state
  const [useUserKey, setUseUserKey] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [verifyingProvider, setVerifyingProvider] = useState<
    'openai' | 'gemini' | null
  >(null);
  const [verified, setVerified] = useState<ProviderVerification>({
    openai: null,
    gemini: null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load BYOK settings from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.useUserKey === 'boolean') {
          setUseUserKey(parsed.useUserKey);
        }
        if (typeof parsed.openaiKey === 'string') {
          setOpenaiKey(parsed.openaiKey);
        }
        if (typeof parsed.geminiKey === 'string') {
          setGeminiKey(parsed.geminiKey);
        }
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    }
  }, []);

  // Check if any provider keys are configured
  const hasConfiguredKeys = useMemo(() => {
    return openaiKey.trim() !== '' || geminiKey.trim() !== '';
  }, [openaiKey, geminiKey]);

  // Reload app keys from server
  const reloadAppKeys = useCallback(async () => {
    try {
      const data = await client.apikeys.list();
      setAppKeys(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to reload app keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Validate environment API keys
  const validateEnvKeys = useCallback(async () => {
    setValidating(true);
    try {
      const data = await client.apikeys.validateEnv();
      setValidation({
        isValid: data.validation,
        missing: data.missing || [],
      });

      queryClient.invalidateQueries({ queryKey: ['quota', 'status'] });
    } catch (error) {
      toast({
        title: 'Validation Failed',
        description: 'Unable to validate environment keys',
        variant: 'destructive',
      });
    } finally {
      setValidating(false);
    }
  }, [toast, queryClient]);

  // Issue new app key
  const issueAppKey = useCallback(async () => {
    setIssuing(true);
    try {
      const data = await client.apikeys.issue({});
      if (data.apiKey) {
        setNewKey(data.apiKey);
        toast({
          title: 'API Key Created',
          description: "Copy it now - it won't be shown again",
        });
      }
      await reloadAppKeys();
    } catch (error) {
      toast({
        title: 'Failed to Create Key',
        description: 'Unable to generate a new API key',
        variant: 'destructive',
      });
    } finally {
      setIssuing(false);
    }
  }, [reloadAppKeys, toast]);

  // Verify and save provider key
  const verifyAndSaveKey = useCallback(
    async (provider: 'openai' | 'gemini') => {
      const key = provider === 'openai' ? openaiKey : geminiKey;

      if (!key.trim()) {
        toast({
          title: 'Invalid Input',
          description: 'Please enter an API key',
          variant: 'destructive',
        });
        return;
      }

      setVerifyingProvider(provider);
      try {
        const res = await client.apikeys.verifyAiKey({
          provider,
          apiKey: key,
        });

        setVerified(prev => ({ ...prev, [provider]: res.valid }));

        if (res.valid) {
          // Save to localStorage
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ useUserKey, openaiKey, geminiKey })
          );

          toast({
            title: 'Key Verified & Saved',
            description: `${provider === 'openai' ? 'OpenAI' : 'Gemini'} key is valid and saved locally`,
          });
        } else {
          toast({
            title: 'Invalid Key',
            description: res.error || 'The provided API key is not valid',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        setVerified(prev => ({ ...prev, [provider]: false }));
        toast({
          title: 'Verification Failed',
          description: error?.message || 'Unable to verify the API key',
          variant: 'destructive',
        });
      } finally {
        setVerifyingProvider(null);
      }
    },
    [openaiKey, geminiKey, useUserKey, toast]
  );

  // Revoke app key
  const revokeAppKey = useCallback(
    async (id: string) => {
      try {
        const res = await client.apikeys.revoke({ id });
        if (!res?.success) {
          throw new Error('Revocation failed');
        }

        await reloadAppKeys();
        toast({
          title: 'Key Revoked',
          description: 'The API key has been successfully revoked',
        });
        setRevokeDialog({ open: false, key: null });
      } catch (error) {
        toast({
          title: 'Revocation Failed',
          description: 'Unable to revoke the API key',
          variant: 'destructive',
        });
      }
    },
    [reloadAppKeys, toast]
  );

  // Copy to clipboard
  const copyToClipboard = useCallback(
    (text: string, label: string) => {
      navigator.clipboard.writeText(text).then(
        () => {
          toast({
            title: 'Copied!',
            description: `${label} copied to clipboard`,
          });
        },
        () => {
          toast({
            title: 'Copy Failed',
            description: 'Unable to copy to clipboard',
            variant: 'destructive',
          });
        }
      );
    },
    [toast]
  );

  // Clear BYOK settings
  const clearBYOKSettings = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setVerified({ openai: null, gemini: null });
    setOpenaiKey('');
    setGeminiKey('');
    setUseUserKey(false);
    toast({
      title: 'Settings Cleared',
      description: 'All BYOK settings have been removed',
    });
  }, [toast]);

  // Close new key notification
  const closeNewKey = useCallback(() => {
    setNewKey(null);
  }, []);

  // Active app keys (not revoked)
  const activeAppKeys = useMemo(() => {
    return appKeys.filter(key => !key.revokedAt);
  }, [appKeys]);

  // Revoked app keys
  const revokedAppKeys = useMemo(() => {
    return appKeys.filter(key => key.revokedAt);
  }, [appKeys]);

  return (
    <div className="bg-background">
      <div className="space-y-6">
        {/* Environment Validation Banner */}
        {validation && (
          <Alert
            variant={validation.isValid ? 'default' : 'destructive'}
            className="border-l-4"
          >
            {validation.isValid ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <AlertTitle className="font-semibold">
              {validation.isValid
                ? 'Environment Keys Valid'
                : 'Configuration Required'}
            </AlertTitle>
            <AlertDescription>
              {validation.isValid
                ? 'All required API keys are properly configured'
                : `Missing required keys: ${validation.missing.join(', ')}`}
            </AlertDescription>
          </Alert>
        )}

        {/* BYOK Section */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>Bring Your Own Key (BYOK)</CardTitle>
                <CardDescription className="mt-1">
                  Use your own AI provider keys. Stored locally in your browser
                  only.
                </CardDescription>
              </div>
              <Button
                variant={useUserKey ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseUserKey(!useUserKey)}
                className="min-w-24"
              >
                {useUserKey ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Enabled
                  </>
                ) : (
                  'Disabled'
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OpenAI Provider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="openai-key" className="text-base font-semibold">
                  OpenAI API Key
                </Label>
                {verified.openai !== null && (
                  <Badge
                    variant={verified.openai ? 'default' : 'destructive'}
                    className="gap-1"
                  >
                    {verified.openai ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Invalid
                      </>
                    )}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="openai-key"
                    type={showOpenaiKey ? 'text' : 'password'}
                    placeholder="sk-..."
                    value={openaiKey}
                    onChange={e => setOpenaiKey(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  >
                    {showOpenaiKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={() => verifyAndSaveKey('openai')}
                  disabled={!openaiKey.trim() || verifyingProvider === 'openai'}
                  className="min-w-32"
                >
                  {verifyingProvider === 'openai' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Verify & Save
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Gemini Provider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="gemini-key" className="text-base font-semibold">
                  Gemini API Key
                </Label>
                {verified.gemini !== null && (
                  <Badge
                    variant={verified.gemini ? 'default' : 'destructive'}
                    className="gap-1"
                  >
                    {verified.gemini ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Invalid
                      </>
                    )}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="gemini-key"
                    type={showGeminiKey ? 'text' : 'password'}
                    placeholder="AIza..."
                    value={geminiKey}
                    onChange={e => setGeminiKey(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                  >
                    {showGeminiKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={() => verifyAndSaveKey('gemini')}
                  disabled={!geminiKey.trim() || verifyingProvider === 'gemini'}
                  className="min-w-32"
                >
                  {verifyingProvider === 'gemini' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Verify & Save
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Actions */}
            {hasConfiguredKeys && (
              <div className="flex justify-end pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={clearBYOKSettings}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application API Keys */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Application API Keys</CardTitle>
                  <CardDescription className="mt-1">
                    Generate keys for programmatic access to your oRPC endpoints
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm">
                {activeAppKeys.length} Active
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* New Key Creation */}
            <div className="space-y-3">
              <Button
                onClick={issueAppKey}
                disabled={issuing}
                className="gap-2"
              >
                {issuing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create New API Key
                  </>
                )}
              </Button>

              {/* New Key Alert */}
              {newKey && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-200">
                    New API Key Created
                  </AlertTitle>
                  <AlertDescription className="mt-2 space-y-3">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Copy this key now - it won't be shown again!
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={newKey}
                        className="font-mono text-xs bg-white dark:bg-gray-900"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(newKey, 'API Key')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={closeNewKey}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Active Keys List */}
            {activeAppKeys.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Active Keys
                </h3>
                <div className="space-y-2">
                  {activeAppKeys.map(key => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{key.name}</div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-mono">••••{key.lastFour}</span>
                          {key.createdAt && (
                            <span>
                              Created{' '}
                              {new Date(key.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setRevokeDialog({ open: true, key })}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revoked Keys List */}
            {revokedAppKeys.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Revoked Keys
                </h3>
                <div className="space-y-2">
                  {revokedAppKeys.map(key => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                    >
                      <div className="space-y-1 opacity-60">
                        <div className="font-medium">{key.name}</div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-mono">••••{key.lastFour}</span>
                          {key.revokedAt && (
                            <span>
                              Revoked{' '}
                              {new Date(key.revokedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">Revoked</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {appKeys.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No API Keys Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first API key to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Validation Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={validateEnvKeys}
            disabled={validating}
            className="gap-2"
          >
            {validating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Validate Environment Keys
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Revoke Confirmation Dialog */}
      <Dialog
        open={revokeDialog.open}
        onOpenChange={open => setRevokeDialog({ open, key: revokeDialog.key })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this API key? This action cannot
              be undone and will immediately invalidate the key.
            </DialogDescription>
          </DialogHeader>
          {revokeDialog.key && (
            <div className="p-4 bg-muted rounded-lg space-y-1">
              <div className="font-medium">{revokeDialog.key.name}</div>
              <div className="text-sm text-muted-foreground font-mono">
                ••••{revokeDialog.key.lastFour}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRevokeDialog({ open: false, key: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                revokeDialog.key && revokeAppKey(revokeDialog.key.id)
              }
            >
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
