'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/lib/orpc/client';
import { useEffect, useMemo, useState } from 'react';

type Profile = {
  id: string;
  name?: string;
  slug?: string;
};

type Account = {
  id: string;
  platform:
    | 'instagram'
    | 'facebook'
    | 'linkedin'
    | 'youtube'
    | 'tiktok'
    | 'threads'
    | 'twitter';
  username?: string;
  handle?: string;
  displayName?: string | null;
};

type GeneratedContent = string | { caption?: string; image?: string };
type Bundle = Record<string, GeneratedContent>;

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKST)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST)' },
];

const contentTypes = [
  {
    value: 'promotional',
    label: 'Promotional',
    description: 'Product launches, sales, offers',
  },
  {
    value: 'educational',
    label: 'Educational',
    description: 'Tips, tutorials, how-tos',
  },
  {
    value: 'inspirational',
    label: 'Inspirational',
    description: 'Quotes, motivation, success stories',
  },
  {
    value: 'behind-scenes',
    label: 'Behind Scenes',
    description: 'Company culture, team updates',
  },
  {
    value: 'user-generated',
    label: 'User Content',
    description: 'Reviews, testimonials, features',
  },
  {
    value: 'trending',
    label: 'Trending',
    description: 'Current events, viral topics',
  },
];

const toneOptions = [
  { value: 'professional', label: 'Professional', emoji: '💼' },
  { value: 'casual', label: 'Casual', emoji: '😊' },
  { value: 'friendly', label: 'Friendly', emoji: '🤝' },
  { value: 'humorous', label: 'Humorous', emoji: '😄' },
  { value: 'inspirational', label: 'Inspirational', emoji: '✨' },
  { value: 'urgent', label: 'Urgent', emoji: '⚡' },
];

interface CreatePostViewProps {
  profiles: Profile[];
  initialSelectedProfile?: string;
  initialAccounts: Account[];
}

export default function CreatePostView({
  profiles,
  initialSelectedProfile,
  initialAccounts,
}: CreatePostViewProps) {
  const { toast } = useToast();

  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    initialSelectedProfile || ''
  );
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts || []);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [contentType, setContentType] = useState('promotional');
  const [targetPlatform, setTargetPlatform] = useState('instagram');
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<any[]>([]);
  const [mediaPrompt, setMediaPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );

  const [publishingOption, setPublishingOption] = useState('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!initialAccounts?.length) return;
    const defaultSelected: Record<string, boolean> = {};
    initialAccounts.forEach(a => (defaultSelected[a.id] = true));
    setSelected(defaultSelected);
  }, [initialAccounts]);

  useEffect(() => {
    if (!selectedProfileId) return;
    async function loadAccounts() {
      try {
        const accountList = await client.social.getConnectedAccounts({
          profileId: selectedProfileId,
        });
        const normalized: Account[] = (accountList as any).map((a: any) => ({
          id: a.id,
          platform: a.platform.toLowerCase(),
          username: a.username,
          displayName: a.displayName,
        }));
        setAccounts(normalized);
        const defaultSelected: Record<string, boolean> = {};
        normalized.forEach(account => {
          defaultSelected[account.id] = true;
        });
        setSelected(defaultSelected);
      } catch {
        setAccounts([]);
        setSelected({});
        toast({
          title: 'Error',
          description: 'Failed to load connected accounts',
          variant: 'destructive',
        });
      }
    }
    loadAccounts();
  }, [selectedProfileId, toast]);

  const selectedAccountIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, checked]) => checked)
        .map(([id]) => id),
    [selected]
  );

  function handleEditGenerated(platform: string, value: string) {
    setBundle(prev => {
      const next: Bundle = { ...(prev || {}) };
      next[platform] = value;
      return next;
    });
  }

  async function handleGenerate() {
    if (!topic.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a topic',
        variant: 'destructive',
      });
      return;
    }
    setBusy(true);
    try {
      const data = await client.posts.compose({
        prompt: topic,
        tone,
        platform: targetPlatform as any,
        contentType: contentType as any,
      });
      setBundle(data as any);
      toast({
        title: 'Success',
        description: `Content generated for ${targetPlatform.toUpperCase()}!`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to generate content',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/mov',
      'video/avi',
      'video/quicktime',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description:
          'Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, MOV, AVI)',
        variant: 'destructive',
      });
      return;
    }

    setImageFile(file);
    setBusy(true);
    setUploading(true);
    try {
      const key = `${Date.now()}-${file.name}`;
      const presign = await client.posts.presignUpload({ key });
      const uploadUrl = (presign as any).presignedUrl as string | undefined;
      if (!uploadUrl) throw new Error('Failed to get presigned URL');

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');

      const publicUrl = (presign as any).publicUrl || key;
      setUploadedMedia([
        {
          url: publicUrl,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          filename: file.name,
          size: file.size,
        },
      ]);
      toast({
        title: 'Success',
        description: file.type.startsWith('video/')
          ? 'Video uploaded successfully!'
          : 'Image uploaded successfully!',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to upload media',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setBusy(false);
    }
  }

  async function handleGenerateImage() {
    if (!mediaPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a description for the image',
        variant: 'destructive',
      });
      return;
    }
    setBusy(true);
    try {
      const data = await client.posts.generateImage({ prompt: mediaPrompt });
      if ((data as any).imageUrl) {
        setGeneratedImageUrl((data as any).imageUrl);
        setUploadedMedia([
          {
            url: (data as any).imageUrl,
            type: 'image',
            filename: 'generated-image.png',
          },
        ]);
        toast({
          title: 'Success',
          description: 'Image generated successfully!',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to generate image',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }

  async function handlePost() {
    if (!bundle || selectedAccountIds.length === 0) {
      toast({
        title: 'Error',
        description: 'Please generate content and select accounts',
        variant: 'destructive',
      });
      return;
    }

    if (publishingOption === 'schedule' && (!scheduledDate || !scheduledTime)) {
      toast({
        title: 'Error',
        description: 'Please select a date and time for scheduling',
        variant: 'destructive',
      });
      return;
    }

    setBusy(true);
    try {
      const platforms = selectedAccountIds.map(accountId => {
        const account = accounts.find(a => a.id === accountId);
        return { accountId, platform: account?.platform };
      });

      let scheduledFor = undefined as string | undefined;
      if (publishingOption === 'schedule') {
        scheduledFor = `${scheduledDate}T${scheduledTime}`;
      }

      const result = await client.posts.createOrSchedulePost({
        profileId: selectedProfileId,
        platforms,
        content: bundle,
        mediaItems: uploadedMedia,
        publishingOption: publishingOption as any,
        scheduledFor,
        timezone,
      });

      if ((result as any).success) {
        let message = 'Posts published successfully!';
        if (publishingOption === 'schedule')
          message = 'Posts scheduled successfully!';
        else if (publishingOption === 'draft')
          message = 'Posts saved as draft!';
        toast({ title: 'Success', description: message });
        setBundle(null);
        setTopic('');
        setImageFile(null);
        setUploadedMedia([]);
        setGeneratedImageUrl(null);
        setMediaPrompt('');
        setScheduledDate('');
        setScheduledTime('');
      } else {
        throw new Error('Failed to process posts');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to process posts',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Create Post</h1>
          <p className="text-muted-foreground">
            Generate and publish content across your social media platforms
          </p>
        </div>

        {/* Profile Selection + Connected Accounts (merged) */}
        <Card>
          <CardHeader>
            <CardTitle>Select Profile & Accounts</CardTitle>
            <CardDescription>
              Choose a profile and select accounts to post to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile">Profile</Label>
              <Select
                value={selectedProfileId}
                onValueChange={setSelectedProfileId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name || profile.slug || profile.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              {!selectedProfileId ? (
                <p className="text-muted-foreground h-[100px] flex items-center justify-center">
                  Please select a profile to view connected accounts.
                </p>
              ) : accounts.length > 0 ? (
                <div className="gap-2 grid grid-cols-1 md:grid-cols-2">
                  {accounts.map(account => (
                    <div
                      key={account.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={account.id}
                        checked={selected[account.id] || false}
                        onCheckedChange={checked =>
                          setSelected(prev => ({
                            ...prev,
                            [account.id]: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor={account.id} className="text-sm">
                        {account.platform.toUpperCase()} -{' '}
                        {account.displayName || account.username || account.id}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground h-[100px] flex items-center justify-center">
                    No accounts connected. Please connect your accounts first.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Generation */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Content</CardTitle>
            <CardDescription>
              Use AI to create platform-specific content with advanced options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Target Platform</Label>
                <Select
                  value={targetPlatform}
                  onValueChange={setTargetPlatform}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">📸 Instagram</SelectItem>
                    <SelectItem value="facebook">👥 Facebook</SelectItem>
                    <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                    <SelectItem value="twitter">🐦 Twitter/X</SelectItem>
                    <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                    <SelectItem value="threads">🧵 Threads</SelectItem>
                    <SelectItem value="youtube">📺 YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span>{type.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {type.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
              <Label>Tone & Style</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {toneOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTone(option.value)}
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                      tone === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-lg">{option.emoji}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={busy || !topic.trim()}
              className="w-full"
              size="lg"
            >
              {busy ? 'Generating...' : '✨ Generate Content'}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content Preview */}
        {bundle && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                Review your platform-specific content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 border-0 pt-0">
              {Object.entries(bundle).map(([platform, content]) => {
                const isObject =
                  typeof content === 'object' && content !== null;
                const caption = isObject
                  ? (content as any).caption
                  : String(content ?? '');
                const imageUrl = isObject ? (content as any).image : undefined;
                return (
                  <div key={platform} className="space-y-2">
                    <Textarea
                      value={caption}
                      onChange={e =>
                        handleEditGenerated(platform, e.target.value)
                      }
                      className="min-h-[120px]"
                    />
                    {!caption && !imageUrl && (
                      <p className="text-sm">No preview available</p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Media Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>
              Upload or generate images and videos for your post
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Media</TabsTrigger>
                <TabsTrigger value="generate">Generate Image</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="media-upload">Upload Image or Video</Label>
                  <Input
                    id="media-upload"
                    type="file"
                    accept="image/*,video/mp4,video/mov,video/avi,video/quicktime"
                    onChange={handleImageUpload}
                    disabled={busy}
                  />
                  {uploading && (
                    <p className="text-xs text-muted-foreground">
                      Uploading...
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Supported: Images (JPEG, PNG, GIF, WebP) and Videos (MP4,
                    MOV, AVI) for Instagram Reels, YouTube Shorts
                  </p>
                </div>
                {imageFile && (
                  <div className="p-3 bg-muted rounded">
                    <p className="text-sm">Selected: {imageFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Type:{' '}
                      {imageFile.type.startsWith('video/') ? 'Video' : 'Image'}{' '}
                      | Size: {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="generate" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="media-prompt">Image Description</Label>
                  <Textarea
                    id="media-prompt"
                    placeholder="Describe the image you want to generate (e.g., 'A modern office workspace with plants and natural lighting')"
                    value={mediaPrompt}
                    onChange={e => setMediaPrompt(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleGenerateImage}
                  disabled={busy || !mediaPrompt.trim()}
                  className="w-full"
                >
                  {busy ? 'Generating...' : 'Generate Image with DALL-E'}
                </Button>
                {generatedImageUrl && (
                  <div className="space-y-2">
                    <Label>Generated Image Preview</Label>
                    <div className="border rounded p-2">
                      <img
                        src={generatedImageUrl || '/placeholder.svg'}
                        alt="Generated image"
                        className="max-w-full h-auto rounded"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Publishing Options */}
        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
            <CardDescription>Choose how to handle your content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Publishing Options
              </Label>
              <RadioGroup
                value={publishingOption}
                onValueChange={setPublishingOption}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="now" id="publish-now" />
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <Label
                      htmlFor="publish-now"
                      className="font-medium cursor-pointer"
                    >
                      Publish now
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="schedule" id="schedule-later" />
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <Label
                      htmlFor="schedule-later"
                      className="font-medium cursor-pointer"
                    >
                      Schedule for later
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="draft" id="save-draft" />
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <Label
                      htmlFor="save-draft"
                      className="font-medium cursor-pointer"
                    >
                      Save as draft
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {publishingOption === 'schedule' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <Label className="text-base font-medium">Schedule for</Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled-date">Date</Label>
                    <Input
                      id="scheduled-date"
                      type="date"
                      value={scheduledDate}
                      onChange={e => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduled-time">Time</Label>
                    <Input
                      id="scheduled-time"
                      type="time"
                      value={scheduledTime}
                      onChange={e => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {scheduledDate && scheduledTime && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                    <p className="text-blue-800">
                      <strong>Scheduled for:</strong>{' '}
                      {new Date(
                        `${scheduledDate}T${scheduledTime}`
                      ).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        timeZone: timezone,
                      })}{' '}
                      ({timezones.find(tz => tz.value === timezone)?.label})
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handlePost}
              disabled={
                busy ||
                !bundle ||
                selectedAccountIds.length === 0 ||
                (publishingOption === 'schedule' &&
                  (!scheduledDate || !scheduledTime))
              }
              className="w-full"
              size="lg"
            >
              {busy
                ? 'Processing...'
                : publishingOption === 'now'
                  ? 'Publish Now'
                  : publishingOption === 'schedule'
                    ? 'Schedule Post'
                    : 'Save as Draft'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
