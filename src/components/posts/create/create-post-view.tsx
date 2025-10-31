'use client';

import type React from 'react';

import { ComposerSection } from '@/components/posts/create/composer-section';
import { GeneratedPreview } from '@/components/posts/create/generated-preview';
import { ScheduleSection } from '@/components/posts/create/scheduled-section';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/lib/orpc/client';
import {
  CreatePostFormSchema,
  type CreatePostFormValues,
} from '@/schemas/post';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConnectedAccount } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

type Profile = {
  id: string;
  name?: string;
  slug?: string;
};

type GeneratedContent = string | { caption?: string; image?: string };
type Bundle = Record<string, GeneratedContent>;

interface CreatePostViewProps {
  profiles: Profile[];
  initialSelectedProfile?: string;
  initialAccounts: ConnectedAccount[];
}

export default function CreatePostView({
  profiles,
  initialSelectedProfile,
  initialAccounts,
}: CreatePostViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    initialSelectedProfile || ''
  );
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(
    initialAccounts || []
  );
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('');
  const [contentType, setContentType] = useState('');
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>([]);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  // Media per platform: Record<platform, mediaItems[]>
  const [platformMedia, setPlatformMedia] = useState<Record<string, any[]>>({});
  // Legacy state for MediaSection (will be removed)
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

  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(CreatePostFormSchema),
    defaultValues: {
      profileId: initialSelectedProfile || '',
      accounts: [],
      platform: (targetPlatforms[0] || '') as any,
      contentType: (contentType || '') as any,
      tone: (tone || '') as any,
      topic: '',
      mediaItems: [],
      publishingOption: publishingOption as any,
      scheduledDate: '',
      scheduledTime: '',
      timezone,
      bundle: {},
    },
  });

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
        const accountList = await client.social['get-connected-accounts']({
          profileId: selectedProfileId,
        });
        const normalized: ConnectedAccount[] = (accountList as any).map(
          (a: any) => ({
            id: a.id,
            platform: a.platform.toLowerCase(),
            username: a.username,
            displayName: a.displayName,
            connectedAt: a.connectedAt,
            isActive: a.isActive,
          })
        );
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
    if (targetPlatforms.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one platform',
        variant: 'destructive',
      });
      return;
    }
    if (!contentType) {
      toast({
        title: 'Error',
        description: 'Please select a content type',
        variant: 'destructive',
      });
      return;
    }
    if (!tone) {
      toast({
        title: 'Error',
        description: 'Please select a tone',
        variant: 'destructive',
      });
      return;
    }
    setBusy(true);
    try {
      // Pre-check AI quota for multiple platforms
      try {
        const quota = await client.quota.status();
        // Enforce BYOK requirement on Free tier
        const tier = (quota as any)?.tier;
        let localAi: any = undefined;
        try {
          const raw = localStorage.getItem('aiSettings');
          localAi = raw ? JSON.parse(raw) : undefined;
        } catch {}
        const hasBYOK = !!localAi?.key;
        if (tier === 'FREE' && !hasBYOK) {
          toast({
            title: 'AI unavailable on Free',
            description:
              'Add your own OpenAI or Gemini API key in Dashboard → API Keys to generate content.',
            variant: 'destructive',
          });
          return;
        }
        const ai = (quota as any)?.ai?.daily;
        if (ai && ai.limit === 0) {
          // If BYOK is present, allow; otherwise block
          if (!hasBYOK)
            throw new Error('AI generation is not available on your plan');
        }
        // Check quota for multiple platforms (skip if BYOK is present)
        if (
          !hasBYOK &&
          ai &&
          ai.limit !== -1 &&
          ai.used + targetPlatforms.length > ai.limit
        ) {
          throw new Error('Daily AI limit reached');
        }
      } catch (e: any) {
        if (e?.message) {
          toast({
            title: 'Limit reached',
            description: e.message,
            variant: 'destructive',
          });
          return;
        }
      }
      let aiConfig: any = undefined;
      try {
        const raw = localStorage.getItem('aiSettings');
        if (raw) {
          const parsed = JSON.parse(raw);
          aiConfig = {
            useUserKey: !!parsed.key,
            provider: parsed.provider === 'gemini' ? 'gemini' : 'openai',
            apiKey: parsed.key,
          };
        }
      } catch {}

      // Generate content for each selected platform
      const newBundle: Bundle = {};

      for (const platform of targetPlatforms) {
        try {
          const data = await client.posts.compose({
            prompt: topic,
            tone,
            platform: platform as any,
            contentType: contentType as any,
            aiConfig,
          });

          // Merge the response into the bundle
          if (data && typeof data === 'object') {
            Object.assign(newBundle, data);
          } else {
            // If response is just a string, use the platform as key
            newBundle[platform] = data as any;
          }
        } catch (e: any) {
          // If one platform fails, continue with others
          console.error(`Failed to generate content for ${platform}:`, e);
          // Add error placeholder for this platform
          newBundle[platform] =
            `Failed to generate content for ${platform}. Please try again.`;
        }
      }

      setBundle(newBundle);
      // Initialize empty media arrays for each platform
      const initialMedia: Record<string, any[]> = {};
      Object.keys(newBundle).forEach(platform => {
        initialMedia[platform] = [];
      });
      setPlatformMedia(initialMedia);
      await queryClient.invalidateQueries({ queryKey: ['quota', 'status'] });

      const successCount = Object.keys(newBundle).length;
      const platformList = targetPlatforms.map(p => p.toUpperCase()).join(', ');
      toast({
        title: 'Success',
        description: `Content generated for ${successCount} ${successCount === 1 ? 'platform' : 'platforms'}: ${platformList}!`,
      });
    } catch (e: any) {
      const errMessage =
        e?.message ||
        e?.data?.message ||
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        'Failed to generate content';
      const title =
        e?.upgradeRequired || e?.data?.upgradeRequired
          ? 'Upgrade required'
          : 'Error';
      toast({
        title,
        description: String(errMessage),
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

  async function handlePlatformMediaUpload(
    platform: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
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
      const mediaItem = {
        url: publicUrl,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        filename: file.name,
        size: file.size,
      };

      setPlatformMedia(prev => ({
        ...prev,
        [platform]: [...(prev[platform] || []), mediaItem],
      }));

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

  function handleUseSameMediaAsFirst(platform: string) {
    if (!bundle) return;
    const platforms = Object.keys(bundle);
    if (platforms.length === 0) return;
    const firstPlatform = platforms[0];
    const firstPlatformMedia = platformMedia[firstPlatform] || [];

    setPlatformMedia(prev => ({
      ...prev,
      [platform]: [...firstPlatformMedia],
    }));

    toast({
      title: 'Media copied',
      description: `Using same media as ${firstPlatform}`,
    });
  }

  function handleRemovePlatformMedia(platform: string, index: number) {
    setPlatformMedia(prev => ({
      ...prev,
      [platform]: (prev[platform] || []).filter((_, i) => i !== index),
    }));
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
      // Pre-check AI quota (image counts as 5 units)
      try {
        const quota = await client.quota.status();
        // Enforce BYOK requirement on Free tier
        const tier = (quota as any)?.tier;
        let localAi: any = undefined;
        try {
          const raw = localStorage.getItem('aiSettings');
          localAi = raw ? JSON.parse(raw) : undefined;
        } catch {}
        const hasBYOK = !!localAi?.key;
        if (tier === 'FREE' && !hasBYOK) {
          toast({
            title: 'AI unavailable on Free',
            description:
              'Add your own OpenAI or Gemini API key in Dashboard → API Keys to generate images.',
            variant: 'destructive',
          });
          return;
        }
        const ai = (quota as any)?.ai?.daily;
        if (ai && ai.limit === 0) {
          if (!hasBYOK)
            throw new Error(
              'AI image generation is not available on your plan'
            );
        }
        if (ai && ai.limit !== -1 && ai.used + 5 > ai.limit) {
          throw new Error('Not enough AI units for image generation');
        }
      } catch (e: any) {
        if (e?.message) {
          toast({
            title: 'Limit reached',
            description: e.message,
            variant: 'destructive',
          });
          return;
        }
      }
      let aiConfig: any = undefined;
      try {
        const raw = localStorage.getItem('aiSettings');
        if (raw) {
          const parsed = JSON.parse(raw);
          aiConfig = {
            useUserKey: !!parsed.key,
            provider: parsed.provider === 'gemini' ? 'gemini' : 'openai',
            apiKey: parsed.key,
          };
        }
      } catch {}
      const data = await client.posts.generateImage({
        prompt: mediaPrompt,
        aiConfig,
      });
      if ((data as any).imageUrl) {
        setGeneratedImageUrl((data as any).imageUrl);
        setUploadedMedia([
          {
            url: (data as any).imageUrl,
            type: 'image',
            filename: 'generated-image.png',
          },
        ]);
        // Revalidate quota after image generation
        try {
          await queryClient.invalidateQueries({
            queryKey: ['quota', 'status'],
          });
        } catch {}
        toast({
          title: 'Success',
          description: 'Image generated successfully!',
        });
      }
    } catch (e: any) {
      const errMessage =
        e?.message ||
        e?.data?.message ||
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        'Failed to generate image';
      const title =
        e?.upgradeRequired || e?.data?.upgradeRequired
          ? 'Upgrade required'
          : 'Error';
      toast({
        title,
        description: String(errMessage),
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }

  async function handlePost() {
    const values: CreatePostFormValues = {
      profileId: selectedProfileId,
      accounts: selectedAccountIds,
      platform: targetPlatforms[0] as any,
      contentType: contentType as any,
      tone: tone as any,
      topic,
      mediaItems: uploadedMedia as any,
      publishingOption: publishingOption as any,
      scheduledDate,
      scheduledTime,
      timezone,
      bundle: bundle as any,
    };

    form.reset(values);
    const valid = await form.trigger();
    if (!valid) {
      const firstError = Object.values(form.formState.errors)[0] as any;
      toast({
        title: 'Validation',
        description: String(firstError?.message || 'Please check the form'),
        variant: 'destructive',
      });
      return;
    }

    // Validate media requirements per platform
    const selectedPlatforms = selectedAccountIds
      .map(id => accounts.find(a => a.id === id)?.platform?.toLowerCase())
      .filter(Boolean) as string[];

    for (const platform of selectedPlatforms) {
      if (platform === 'instagram') {
        const platformMediaItems = platformMedia[platform] || [];
        if (platformMediaItems.length === 0) {
          toast({
            title: 'Instagram requires media',
            description: `Please upload at least one image or video for Instagram (${platform}).`,
            variant: 'destructive',
          });
          return;
        }
      }
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

      // Aggregate all media items (API expects a single array for now)
      // TODO: Update API to support per-platform media
      const allMediaItems = Object.values(platformMedia).flat();

      const result = await client.posts.createOrSchedulePost({
        profileId: selectedProfileId,
        platforms,
        content: bundle,
        mediaItems: allMediaItems.length > 0 ? allMediaItems : uploadedMedia,
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
        setPlatformMedia({});
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
    <div className="container mx-auto p-2">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Content Generation - Only show when no bundle exists */}
          {!bundle && (
            <ComposerSection
              targetPlatforms={targetPlatforms}
              setTargetPlatforms={setTargetPlatforms}
              contentType={contentType}
              setContentType={setContentType}
              topic={topic}
              setTopic={setTopic}
              tone={tone}
              setTone={setTone}
              onGenerate={handleGenerate}
              busy={busy}
            />
          )}

          {/* Generated Content Preview with per-platform media upload */}
          {bundle && (
            <GeneratedPreview
              bundle={bundle as any}
              onEdit={handleEditGenerated}
              platformMedia={platformMedia}
              onPlatformMediaUpload={handlePlatformMediaUpload}
              onUseSameMediaAsFirst={handleUseSameMediaAsFirst}
              onRemovePlatformMedia={handleRemovePlatformMedia}
              busy={busy}
              uploading={uploading}
            />
          )}
        </div>

        <div className="xl:col-span-1 self-start">
          <div className="sticky top-28 md:top-24 z-10 max-h-[calc(100dvh-6rem)] overflow-y-auto space-y-6">
            {/* Profile Selection + Connected Accounts */}
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
                            {account.displayName ||
                              account.username ||
                              account.id}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-muted-foreground h-[100px] flex items-center justify-center">
                        No accounts connected. Please connect your accounts
                        first.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Publishing Options */}
            <ScheduleSection
              busy={busy}
              publishingOption={publishingOption}
              setPublishingOption={setPublishingOption}
              scheduledDate={scheduledDate}
              setScheduledDate={setScheduledDate}
              scheduledTime={scheduledTime}
              setScheduledTime={setScheduledTime}
              timezone={timezone}
              setTimezone={setTimezone}
              onSubmit={handlePost}
              canSubmit={
                !!bundle &&
                selectedAccountIds.length > 0 &&
                (publishingOption !== 'schedule' ||
                  (!!scheduledDate && !!scheduledTime))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
