/**
 * Social Media Publisher Factory
 * Routes publishing requests to the appropriate platform publisher
 */

import { FacebookPublisher } from './facebook-publisher';
import { InstagramPublisher } from './instagram-publisher';
import { BaseSocialPublisher } from './types';

// Registry of all available publishers
const publishers: BaseSocialPublisher[] = [
  new InstagramPublisher(),
  new FacebookPublisher(),
];

/**
 * Get the appropriate publisher for a platform
 */
export function getPublisher(platform: string): BaseSocialPublisher | null {
  const normalizedPlatform = platform.toLowerCase();
  return publishers.find(p => p.supports(normalizedPlatform)) || null;
}

/**
 * Check if a platform is supported
 */
export function isPlatformSupported(platform: string): boolean {
  return getPublisher(platform) !== null;
}

/**
 * Get list of all supported platforms
 */
export function getSupportedPlatforms(): string[] {
  return publishers.map(p => p.platform);
}

// Re-export types for convenience
export { BaseSocialPublisher } from './types';
export type { PublishMediaItem, PublishRequest, PublishResult } from './types';
