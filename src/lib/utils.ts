import { clsx, type ClassValue } from 'clsx';
import { createHash, randomBytes } from 'crypto';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateApiKey(prefix: string = 'sk_live'): string {
  const token = randomBytes(24)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `${prefix}_${token}`;
}

export function getApiKeyLastFour(apiKey: string): string {
  const clean = apiKey.replace(/^\w+_/, '');
  return clean.slice(-4);
}

export function hashApiKeySha256(apiKey: string): string {
  const hash = createHash('sha256');
  hash.update(apiKey);
  return hash.digest('hex');
}
