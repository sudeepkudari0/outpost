import * as z from 'zod';

export const CreatePostFormSchema = z
  .object({
    profileId: z.string().min(1, 'Profile is required'),
    accounts: z.array(z.string()).min(1, 'Select at least one account'),

    // Composer
    platform: z.enum([
      'instagram',
      'facebook',
      'linkedin',
      'twitter',
      'tiktok',
      'threads',
      'youtube',
    ]),
    contentType: z.enum([
      'promotional',
      'educational',
      'inspirational',
      'behind-scenes',
      'user-generated',
      'trending',
    ]),
    tone: z.enum([
      'professional',
      'casual',
      'friendly',
      'humorous',
      'inspirational',
      'urgent',
    ]),
    topic: z.string().min(1, 'Topic is required'),

    // Media
    mediaItems: z
      .array(
        z.object({
          url: z.string().url('Media URL must be valid'),
          type: z.enum(['image', 'video']).optional(),
          filename: z.string().optional(),
          size: z.number().optional(),
        })
      )
      .optional()
      .default([]),

    // Publishing
    publishingOption: z.enum(['now', 'schedule', 'draft']),
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
    timezone: z.string().optional(),
    bundle: z.any().optional(),
  })
  .refine(
    data => {
      if (data.publishingOption !== 'schedule') return true;
      return !!data.scheduledDate && !!data.scheduledTime && !!data.timezone;
    },
    {
      path: ['scheduledDate'],
      message: 'Date, time and timezone are required for scheduling',
    }
  )
  .refine(
    data => {
      // For drafts, bundle is optional - allow saving without content
      if (data.publishingOption === 'draft') return true;
      // For publish/schedule, require bundle with content
      return !!data.bundle && Object.keys(data.bundle || {}).length > 0;
    },
    {
      path: ['bundle'],
      message: 'Generate content before publishing',
    }
  );

export type CreatePostFormValues = z.infer<typeof CreatePostFormSchema>;
