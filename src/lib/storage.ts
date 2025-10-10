'use server';

import { Thinkroman } from '@thinkroman/api';

const token = process.env.S3_TOKEN as string;
const tr = new Thinkroman({ key: token });

export async function getPresignedUrl(key: string) {
  try {
    return await tr.storage.r2.uploadUrl({ key: `social-saas/${key}` });
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    return { error: 'Failed to get presigned URL' } as const;
  }
}

export async function deleteFile(key: string) {
  try {
    await fetch(
      `https://api.thinkroman.com/v1/storage/r2.deleteObject?key=${encodeURIComponent(
        key
      )}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return { success: true } as const;
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: 'Failed to delete file' } as const;
  }
}
