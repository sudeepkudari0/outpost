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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Content</CardTitle>
        <CardDescription>
          Use AI to create platform-specific content with advanced options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic or Prompt</Label>
          <Textarea
            id="topic"
            placeholder="What would you like to post about? Be specific for better results..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="min-h-[100px]"
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
              >
                <span className="text-base md:text-lg">{option.emoji}</span>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={onGenerate}
          disabled={busy || !topic.trim()}
          className="w-full"
          size="lg"
        >
          {busy ? 'Generating...' : '✨ Generate Content'}
        </Button>
      </CardContent>
    </Card>
  );
}
