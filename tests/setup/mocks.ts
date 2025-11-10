import { vi } from 'vitest';

// Mock Prisma client
export const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  account: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  post: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  session: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  socialProfile: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

// Mock NextAuth
export const mockNextAuth = {
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
};

// Mock API clients
export const mockOrpcClient = {
  auth: {
    signIn: vi.fn(),
    signUp: vi.fn(),
  },
  posts: {
    list: vi.fn(),
    create: vi.fn(),
  },
};

// Mock OpenAI
export const mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn(),
    },
  },
  images: {
    generate: vi.fn(),
  },
};

// Helper to reset all mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
  Object.values(mockPrisma).forEach(model => {
    Object.values(model).forEach(method => {
      if (typeof method === 'function') {
        method.mockReset();
      }
    });
  });
};
