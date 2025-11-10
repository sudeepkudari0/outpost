'use client';

import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

type Bundle = Record<string, string | { caption?: string; image?: string }>;
type MediaItem = {
  url: string;
  type?: 'image' | 'video';
  filename?: string;
  size?: number;
};

const PLATFORM_LABELS: Record<
  string,
  { label: string; icon: string; fallback?: string }
> = {
  instagram: {
    label: 'Instagram',
    icon: '/images/logos/instagram.png',
    fallback: '📸',
  },
  facebook: {
    label: 'Facebook',
    icon: '/images/logos/facebook.png',
    fallback: '👥',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: '/images/logos/linkedin.png',
    fallback: '💼',
  },
  twitter: { label: 'Twitter/X', icon: '', fallback: '🐦' },
  tiktok: { label: 'TikTok', icon: '', fallback: '🎵' },
  threads: { label: 'Threads', icon: '', fallback: '🧵' },
  youtube: { label: 'YouTube', icon: '', fallback: '📺' },
};

type PlatformCardProps = {
  platform: string;
  caption: string;
  platformInfo: { label: string; icon: string; fallback?: string };
  mediaItems: MediaItem[];
  isFirstPlatform: boolean;
  canUseSameMedia: boolean;
  firstPlatform: string;
  onEdit: (platform: string, value: string) => void;
  onPlatformMediaUpload: (
    platform: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onUseSameMediaAsFirst: (platform: string) => void;
  onRemovePlatformMedia: (platform: string, index: number) => void;
  busy: boolean;
  uploading: boolean;
};

function PlatformCard({
  platform,
  caption,
  platformInfo,
  mediaItems,
  isFirstPlatform,
  canUseSameMedia,
  firstPlatform,
  onEdit,
  onPlatformMediaUpload,
  onUseSameMediaAsFirst,
  onRemovePlatformMedia,
  busy,
  uploading,
}: PlatformCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight to show all content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [caption]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {platformInfo.icon ? (
              <Image
                src={platformInfo.icon}
                alt={platformInfo.label}
                width={24}
                height={24}
                className="size-6"
              />
            ) : (
              <span className="text-2xl">{platformInfo.fallback}</span>
            )}
            <CardTitle className="text-lg capitalize">
              {platformInfo.label}
            </CardTitle>
          </div>
          {mediaItems.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {mediaItems.length}{' '}
              {mediaItems.length === 1 ? 'media' : 'media items'}
            </Badge>
          )}
        </div>
        <CardDescription>
          Edit your content and upload media for this platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content Textarea */}
        <div className="space-y-2">
          <Label htmlFor={`content-${platform}`}>Content</Label>
          <Textarea
            ref={textareaRef}
            id={`content-${platform}`}
            value={caption}
            onChange={e => {
              onEdit(platform, e.target.value);
              // Auto-resize on input
              const textarea = e.target;
              textarea.style.height = 'auto';
              textarea.style.height = `${textarea.scrollHeight}px`;
            }}
            className="min-h-[120px] text-base resize-none overflow-hidden"
            placeholder="No content generated for this platform"
            rows={1}
          />
        </div>

        <Separator />

        {/* Media Upload Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor={`media-${platform}`}>Media</Label>
            {canUseSameMedia && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onUseSameMediaAsFirst(platform)}
                className="text-xs h-7"
              >
                Use same as{' '}
                {PLATFORM_LABELS[firstPlatform]?.label || firstPlatform}
              </Button>
            )}
          </div>

          {/* Upload Input */}
          <div className="space-y-2">
            <Input
              id={`media-${platform}`}
              type="file"
              accept="image/*,video/mp4,video/mov,video/avi,video/quicktime"
              onChange={e => onPlatformMediaUpload(platform, e)}
              disabled={busy || uploading}
              className="cursor-pointer"
            />
            {uploading && (
              <p className="text-xs text-muted-foreground">Uploading...</p>
            )}
            <p className="text-xs text-muted-foreground">
              Supported: Images (JPEG, PNG, GIF, WebP) and Videos (MP4, MOV,
              AVI)
            </p>
          </div>

          {/* Media Preview Grid */}
          {mediaItems.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Uploaded Media</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mediaItems.map((item, mediaIndex) => (
                  <div
                    key={mediaIndex}
                    className="relative group rounded-lg border overflow-hidden bg-muted/50"
                  >
                    {item.type === 'video' ? (
                      <video
                        src={item.url}
                        className="w-full h-32 object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.filename || `Media ${mediaIndex + 1}`}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() =>
                        onRemovePlatformMedia(platform, mediaIndex)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {item.filename && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                        {item.filename}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {mediaItems.length === 0 && !canUseSameMedia && (
            <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
              <p className="text-sm">
                {platform === 'instagram'
                  ? 'Instagram requires at least one media item'
                  : 'No media uploaded for this platform'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type Props = {
  bundle: Bundle;
  onEdit: (platform: string, value: string) => void;
  platformMedia: Record<string, MediaItem[]>;
  onPlatformMediaUpload: (
    platform: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onUseSameMediaAsFirst: (platform: string) => void;
  onRemovePlatformMedia: (platform: string, index: number) => void;
  busy: boolean;
  uploading: boolean;
};

export function GeneratedPreview({
  bundle,
  onEdit,
  platformMedia,
  onPlatformMediaUpload,
  onUseSameMediaAsFirst,
  onRemovePlatformMedia,
  busy,
  uploading,
}: Props) {
  if (!bundle) return null;

  const platformEntries = Object.entries(bundle);
  if (platformEntries.length === 0) return null;

  const firstPlatform = platformEntries[0]?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Generated Content</h2>
          <p className="text-sm text-muted-foreground">
            Review and customize content for each platform
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {platformEntries.length}{' '}
          {platformEntries.length === 1 ? 'platform' : 'platforms'}
        </Badge>
      </div>

      <div className="space-y-4">
        {platformEntries.map(([platform, content], index) => {
          const isObject = typeof content === 'object' && content !== null;
          const caption = isObject ? content.caption : String(content ?? '');
          const imageUrl = isObject ? content.image : undefined;
          const platformInfo = PLATFORM_LABELS[platform] || {
            label: platform,
            icon: '',
            fallback: '📱',
          };

          const mediaItems = platformMedia[platform] || [];
          const isFirstPlatform = index === 0;
          const firstPlatformMedia = platformMedia[firstPlatform] || [];
          const canUseSameMedia =
            !isFirstPlatform && firstPlatformMedia.length > 0;

          return (
            <PlatformCard
              key={platform}
              platform={platform}
              caption={caption || ''}
              platformInfo={platformInfo}
              mediaItems={mediaItems}
              isFirstPlatform={isFirstPlatform}
              canUseSameMedia={canUseSameMedia}
              firstPlatform={firstPlatform}
              onEdit={onEdit}
              onPlatformMediaUpload={onPlatformMediaUpload}
              onUseSameMediaAsFirst={onUseSameMediaAsFirst}
              onRemovePlatformMedia={onRemovePlatformMedia}
              busy={busy}
              uploading={uploading}
            />
          );
        })}
      </div>
    </div>
  );
}
