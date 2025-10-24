export type FeatureFlags = {
  aiComposer: boolean;
  aiMedia: boolean;
  schedulingQueue: boolean;
};

export const flags: FeatureFlags = {
  aiComposer: process.env.NEXT_PUBLIC_FEATURE_AI_COMPOSER === 'true',
  aiMedia: process.env.NEXT_PUBLIC_FEATURE_AI_MEDIA === 'true',
  schedulingQueue: process.env.NEXT_PUBLIC_FEATURE_SCHEDULING_QUEUE === 'true',
};

export function isFeatureEnabled<K extends keyof FeatureFlags>(key: K) {
  return !!flags[key];
}
