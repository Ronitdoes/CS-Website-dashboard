'use server';

import { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { r2Client } from '../r2';

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const HACKX_BUCKET_NAME = process.env.HACKX_R2_BUCKET_NAME || 'hackx-4';
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN!;
const HACKX_PUBLIC_DOMAIN = process.env.HACKX_R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_DOMAIN!;

function resolveBucket(bucketTypeOrName?: string, folder?: string): string {
  if (bucketTypeOrName === 'hackx' || bucketTypeOrName === HACKX_BUCKET_NAME) return HACKX_BUCKET_NAME;
  if (bucketTypeOrName === 'main' || bucketTypeOrName === BUCKET_NAME) return BUCKET_NAME;
  if (bucketTypeOrName && bucketTypeOrName !== 'all') return bucketTypeOrName;
  if (folder === 'hackx') return HACKX_BUCKET_NAME;
  return BUCKET_NAME;
}

function resolvePublicDomain(bucketTypeOrName?: string, folder?: string): string {
  if (bucketTypeOrName === 'hackx' || bucketTypeOrName === HACKX_BUCKET_NAME) return HACKX_PUBLIC_DOMAIN;
  if (bucketTypeOrName === 'main' || bucketTypeOrName === BUCKET_NAME) return PUBLIC_DOMAIN;
  if (folder === 'hackx') return HACKX_PUBLIC_DOMAIN;
  return PUBLIC_DOMAIN;
}

export async function uploadMediaToR2Action(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const bucketType = (formData.get('bucketType') as string) || (formData.get('bucket') as string);
    const defaultFolder = bucketType === 'hackx' ? 'hackx' : 'media';
    const folder = (formData.get('folder') as string) || defaultFolder;

    const targetBucket = resolveBucket(bucketType, folder);
    const targetDomain = resolvePublicDomain(bucketType, folder);

    if (!file) throw new Error('File not found');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: targetBucket,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await r2Client.send(uploadCommand);
    const publicUrl = `${targetDomain.replace(/\/$/, '')}/${fileName}`;

    return { success: true, url: publicUrl, path: fileName, bucket: targetBucket };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function listR2MediaFilesAction(folder = 'all', bucketTypeOrName?: string) {
  try {
    const targetBucket = resolveBucket(bucketTypeOrName, folder);
    const targetDomain = resolvePublicDomain(bucketTypeOrName, folder);
    const prefix = folder && folder !== 'all' ? `${folder}/` : undefined;

    const command = new ListObjectsV2Command({
      Bucket: targetBucket,
      Prefix: prefix,
    });

    const response = await r2Client.send(command);
    const files = (response.Contents || [])
      .filter(item => item.Key && (prefix ? item.Key !== prefix : true) && !item.Key.endsWith('/'))
      .map(item => {
        const publicUrl = `${targetDomain.replace(/\/$/, '')}/${item.Key}`;
        return {
          name: item.Key?.split('/').pop() || '',
          key: item.Key || '',
          url: publicUrl,
          size: item.Size || 0,
          lastModified: item.LastModified || new Date(),
          bucket: targetBucket,
        };
      })
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    return { success: true, files, bucketName: targetBucket };
  } catch (e) {
    return { success: false, error: (e as Error).message, files: [] };
  }
}

export async function deleteMediaFromR2Action(path: string, bucketTypeOrName?: string) {
  try {
    const targetBucket = resolveBucket(bucketTypeOrName, path.startsWith('hackx/') ? 'hackx' : 'main');
    const deleteCommand = new DeleteObjectCommand({
      Bucket: targetBucket,
      Key: path,
    });

    await r2Client.send(deleteCommand);
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

