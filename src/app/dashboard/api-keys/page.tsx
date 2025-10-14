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

export default function ApiKeysPage() {
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    missing: string[];
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setOpenaiApiKey(data.openaiApiKey || '');
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const saveApiKeys = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openaiApiKey,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setValidation({
          isValid: data.validation,
          missing: data.missing || [],
        });
        setSaved(true);
        toast({
          title: 'API Keys Saved',
          description: data.validation
            ? 'Your API keys have been securely saved and validated.'
            : 'API keys saved, but some are missing. Check the validation below.',
        });
        setTimeout(() => setSaved(false), 2000);
      } else {
        throw new Error('Failed to save API keys');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save API keys. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
      </div>
    </div>
  );
}
