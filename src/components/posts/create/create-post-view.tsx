'use client';

import type React from 'react';

import { ComposerSection } from '@/components/posts/create/composer-section';
import { GeneratedPreview } from '@/components/posts/create/generated-preview';
import { MediaSection } from '@/components/posts/create/media-section';
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

  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    initialSelectedProfile || ''
  );
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(
    initialAccounts || []
  );
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

  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(CreatePostFormSchema),
    defaultValues: {
      profileId: initialSelectedProfile || '',
      accounts: [],
      platform: targetPlatform as any,
      contentType: contentType as any,
      tone: tone as any,
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
    const values: CreatePostFormValues = {
      profileId: selectedProfileId,
      accounts: selectedAccountIds,
      platform: targetPlatform as any,
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

    // Validate media requirements for Instagram before proceeding
    const selectedPlatforms = selectedAccountIds
      .map(id => accounts.find(a => a.id === id)?.platform?.toLowerCase())
      .filter(Boolean) as string[];
    if (selectedPlatforms.includes('instagram') && uploadedMedia.length === 0) {
      toast({
        title: 'Instagram requires media',
        description:
          'Please upload at least one image or video to post on Instagram.',
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
    <div className="container mx-auto p-2">
      <div className="mb-4">
        <h1 className="md:text-3xl text-2xl font-bold">Create Post</h1>
        <p className="md:text-base text-sm text-muted-foreground">
          Generate and publish content across your social media platforms
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Content Generation */}
          <ComposerSection
            targetPlatform={targetPlatform}
            setTargetPlatform={setTargetPlatform}
            contentType={contentType}
            setContentType={setContentType}
            topic={topic}
            setTopic={setTopic}
            tone={tone}
            setTone={setTone}
            onGenerate={handleGenerate}
            busy={busy}
          />

          {/* Generated Content Preview */}
          {bundle && (
            <GeneratedPreview
              bundle={bundle as any}
              onEdit={handleEditGenerated}
            />
          )}

          {/* Media Upload */}
          <MediaSection
            busy={busy}
            uploading={uploading}
            imageFile={imageFile}
            generatedImageUrl={generatedImageUrl}
            mediaPrompt={mediaPrompt}
            setMediaPrompt={setMediaPrompt}
            onUpload={handleImageUpload}
            onGenerateImage={handleGenerateImage}
          />
        </div>

        <div className="xl:col-span-1">
          <div className="xl:sticky xl:top-6 space-y-6">
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
