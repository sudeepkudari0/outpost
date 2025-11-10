import {
  cn,
  generateApiKey,
  getApiKeyLastFour,
  hashApiKeySha256,
} from '@/lib/utils';
import { describe, expect, it } from 'vitest';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('merges Tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });
  });

  describe('generateApiKey', () => {
    it('generates an API key with default prefix', () => {
      const key = generateApiKey();
      expect(key).toMatch(/^sk_live_[A-Za-z0-9_-]+$/);
    });

    it('generates an API key with custom prefix', () => {
      const key = generateApiKey('pk_test');
      expect(key).toMatch(/^pk_test_[A-Za-z0-9_-]+$/);
    });

    it('generates unique keys', () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('getApiKeyLastFour', () => {
    it('extracts last four characters', () => {
      // Function removes prefix "sk_live_" -> "abc123xyz", then gets last 4: "3xyz"
      expect(getApiKeyLastFour('sk_live_abc123xyz')).toBe('3xyz');
    });

    it('handles keys without prefix', () => {
      expect(getApiKeyLastFour('abcdefghijklmnop')).toBe('mnop');
    });

    it('handles keys shorter than 4 characters', () => {
      expect(getApiKeyLastFour('sk_live_ab')).toBe('ab');
    });
  });

  describe('hashApiKeySha256', () => {
    it('generates consistent hash', () => {
      const key = 'test-api-key';
      const hash1 = hashApiKeySha256(key);
      const hash2 = hashApiKeySha256(key);
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('generates different hashes for different keys', () => {
      const hash1 = hashApiKeySha256('key1');
      const hash2 = hashApiKeySha256('key2');
      expect(hash1).not.toBe(hash2);
    });
  });
});
