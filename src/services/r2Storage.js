// Cloudflare R2 S3-Compatible File Storage Service
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export function getR2Config() {
  const ACCOUNT_ID = import.meta.env?.VITE_R2_ACCOUNT_ID || '';
  const ACCESS_KEY_ID = import.meta.env?.VITE_R2_ACCESS_KEY_ID || '';
  const SECRET_ACCESS_KEY = import.meta.env?.VITE_R2_SECRET_ACCESS_KEY || '';
  const BUCKET_NAME = import.meta.env?.VITE_R2_BUCKET_NAME || 'comsats-resources';
  const PUBLIC_URL = import.meta.env?.VITE_R2_PUBLIC_URL || '';

  const configured = Boolean(ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY);

  let client = null;
  if (configured) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY
      }
    });
  }

  return { ACCOUNT_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME, PUBLIC_URL, configured, client };
}

export const isR2Configured = Boolean(
  import.meta.env?.VITE_R2_ACCOUNT_ID &&
  import.meta.env?.VITE_R2_ACCESS_KEY_ID &&
  import.meta.env?.VITE_R2_SECRET_ACCESS_KEY
);

/**
 * Upload a document file to Cloudflare R2 Bucket
 * @param {File} file - The binary File object from browser input
 * @returns {Promise<{ url: string, fileName: string, fileSize: string, fileType: string, storageEngine: string } | null>}
 */
export async function uploadFileToR2(file) {
  const { ACCOUNT_ID, BUCKET_NAME, PUBLIC_URL, configured, client } = getR2Config();

  if (!file || !configured || !client) {
    console.warn('[COMSATS Vault] R2 Upload skipped: Config missing or incomplete in environment.');
    return null;
  }

  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
  const fileExt = file.name.split('.').pop() || 'pdf';
  const uniqueKey = `resources/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueKey,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type || 'application/pdf'
    });

    await client.send(command);

    // Form permanent CDN Public URL
    const fileUrl = PUBLIC_URL 
      ? `${PUBLIC_URL.replace(/\/$/, '')}/${uniqueKey}` 
      : `https://${BUCKET_NAME}.${ACCOUNT_ID}.r2.cloudflarestorage.com/${uniqueKey}`;

    console.log('[COMSATS Vault] Successfully uploaded to Cloudflare R2:', fileUrl);

    return {
      url: fileUrl,
      fileName: file.name,
      fileSize: fileSizeMB,
      fileType: fileExt,
      storageEngine: 'cloudflare-r2'
    };
  } catch (err) {
    console.error('Cloudflare R2 upload failed:', err);
    return null;
  }
}

/**
 * Delete a document file from Cloudflare R2 Bucket using its URL
 * @param {string} fileUrl 
 * @returns {Promise<boolean>}
 */
export async function deleteFileFromR2(fileUrl) {
  const { BUCKET_NAME, configured, client } = getR2Config();
  if (!fileUrl || !configured || !client) return false;

  try {
    // Extract key from URL (e.g., "resources/1722...pdf")
    let key = '';
    if (fileUrl.includes('resources/')) {
      key = 'resources/' + fileUrl.split('resources/')[1];
    } else {
      const parts = fileUrl.split('/');
      key = parts[parts.length - 1];
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await client.send(command);
    console.log('[COMSATS Vault] Successfully deleted file from Cloudflare R2:', key);
    return true;
  } catch (err) {
    console.error('Failed to delete file from Cloudflare R2:', err);
    return false;
  }
}

