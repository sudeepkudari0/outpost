import { CreatePostFormSchema } from '@/schemas/post';
import { describe, expect, it } from 'vitest';

describe('CreatePostFormSchema', () => {
  it('requires accounts and bundle', () => {
    const res = CreatePostFormSchema.safeParse({
      profileId: 'p1',
      accounts: [],
      platform: 'instagram',
      contentType: 'promotional',
      tone: 'professional',
      topic: 'Hello',
      publishingOption: 'now',
      bundle: {},
    });
    expect(res.success).toBe(false);
  });

  it('accepts schedule only with date/time/timezone', () => {
    const res = CreatePostFormSchema.safeParse({
      profileId: 'p1',
      accounts: ['a1'],
      platform: 'instagram',
      contentType: 'promotional',
      tone: 'professional',
      topic: 'Hello',
      publishingOption: 'schedule',
      scheduledDate: '2099-01-01',
      scheduledTime: '',
      timezone: 'America/Los_Angeles',
      bundle: { instagram: 'caption' },
    });
    expect(res.success).toBe(false);
  });

  it('passes with valid now publish', () => {
    const res = CreatePostFormSchema.safeParse({
      profileId: 'p1',
      accounts: ['a1'],
      platform: 'instagram',
      contentType: 'promotional',
      tone: 'professional',
      topic: 'Hello',
      publishingOption: 'now',
      bundle: { instagram: 'caption' },
    });
    expect(res.success).toBe(true);
  });
});
