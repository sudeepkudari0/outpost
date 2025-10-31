'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { client } from '@/lib/orpc/client';
import { useEffect, useState } from 'react';
import { contentTypes, toneOptions } from './constants';

type Props = {
  targetPlatform: string;
  setTargetPlatform: (v: string) => void;
  contentType: string;
  setContentType: (v: string) => void;
  topic: string;
  setTopic: (v: string) => void;
  tone: string;
  setTone: (v: string) => void;
  onGenerate: () => void;
  busy: boolean;
};

export function ComposerSection({
  targetPlatform,
  setTargetPlatform,
  contentType,
  setContentType,
  topic,
  setTopic,
  tone,
  setTone,
  onGenerate,
  busy,
}: Props) {
  const [aiDisabled, setAiDisabled] = useState(false);
  const [aiBanner, setAiBanner] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const quota = await client.quota.status();
        const tier = (quota as any)?.tier;
        let localAi: any = undefined;
        try {
          const raw = localStorage.getItem('aiSettings');
          localAi = raw ? JSON.parse(raw) : undefined;
        } catch {}
        const hasBYOK = !!localAi?.key;
        if (tier === 'FREE' && !hasBYOK) {
          if (!mounted) return;
          setAiDisabled(true);
          setAiBanner(
            'AI is unavailable on Free. Add your OpenAI or Gemini API key in Dashboard → API Keys to generate content.'
          );
          return;
        }
        const ai = (quota as any)?.ai?.daily;
        if (ai && ai.limit === 0 && !hasBYOK) {
          if (!mounted) return;
          setAiDisabled(true);
          setAiBanner(
            'Your plan does not include AI. Add your own API key to use the composer.'
          );
          return;
        }
        if (!mounted) return;
        setAiDisabled(false);
        setAiBanner(null);
      } catch {
        if (!mounted) return;
        setAiDisabled(false);
        setAiBanner(null);
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Content</CardTitle>
        <CardDescription>
          Use AI to create platform-specific content with advanced options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {aiBanner && (
          <div className="text-sm rounded-md border border-yellow-300/50 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200 p-3">
            {aiBanner}{' '}
            <a href="/dashboard/api-keys" className="underline">
              Open API Keys
            </a>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="topic">Topic or Prompt</Label>
          <Textarea
            id="topic"
            placeholder="What would you like to post about? Be specific for better results..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="min-h-[100px]"
            disabled={aiDisabled}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm md:text-base">Target Platform</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'instagram', label: 'Instagram', icon: '📸' },
              { value: 'facebook', label: 'Facebook', icon: '👥' },
              { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
              { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
              { value: 'tiktok', label: 'TikTok', icon: '🎵' },
              { value: 'threads', label: 'Threads', icon: '🧵' },
              { value: 'youtube', label: 'YouTube', icon: '📺' },
            ].map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setTargetPlatform(p.value)}
                className={`inline-flex items-center gap-2 px-2 py-1 md:px-3 md:py-2 rounded-full border text-xs md:text-sm transition-all ${
                  targetPlatform === p.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                disabled={aiDisabled}
              >
                <span className="text-base md:text-lg">{p.icon}</span>
                <span className="font-medium">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm md:text-base">Content Type</Label>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setContentType(type.value)}
                title={type.description}
                className={`px-2 py-1 md:px-3 md:py-2 rounded-full border text-xs md:text-sm transition-all ${
                  contentType === type.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                disabled={aiDisabled}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm md:text-base">Tone & Style</Label>
          <div className="flex flex-wrap gap-2">
            {toneOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTone(option.value)}
                className={`inline-flex items-center gap-2 px-2 py-1 md:px-3 md:py-2 rounded-full border text-xs md:text-sm transition-all ${
                  tone === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                disabled={aiDisabled}
              >
                <span className="text-base md:text-lg">{option.emoji}</span>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={onGenerate}
          disabled={busy || !topic.trim() || aiDisabled || checking}
          className="w-full"
          size="lg"
        >
          {busy
            ? 'Generating...'
            : aiDisabled
              ? 'AI not available'
              : '✨ Generate Content'}
        </Button>
      </CardContent>
    </Card>
  );
}
