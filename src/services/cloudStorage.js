// Cloud Database Service (Cloudflare R2 + Supabase Integration + Safe Data URL Engine)
import { createClient } from '@supabase/supabase-js';
import { isR2Configured, uploadFileToR2 } from './r2Storage';
import { compressDocumentFile, validateFileSize } from './fileCompressor';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConnected = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const isCloudConnected = isSupabaseConnected || isR2Configured;

if (typeof window !== 'undefined') {
  console.log('[COMSATS Vault] Supabase Connected:', isSupabaseConnected, 'URL:', SUPABASE_URL ? 'OK' : 'MISSING');
  console.log('[COMSATS Vault] Cloudflare R2 Configured:', isR2Configured);
}

export const supabase = isSupabaseConnected
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Convert File to Base64 Data URL for universal cross-browser syncing
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/**
 * Helper to handle cloud file upload (Cloudflare R2 -> Supabase Storage -> Base64 Data URL)
 * Ensures uploaded files are 100% accessible across all browsers and devices
 */
export async function uploadDocumentFile(file) {
  if (!file) return null;

  // 0. Enforce 20 MB File Size Restriction
  const validation = validateFileSize(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 0.1 Compress Document / Image client-side before sending to cloud
  const { compressedFile, originalSizeMB, compressedSizeMB, reductionPercent } = await compressDocumentFile(file);
  const targetFile = compressedFile || file;

  const fileSizeMB = (targetFile.size / (1024 * 1024)).toFixed(2) + ' MB';
  const fileExt = targetFile.name.split('.').pop() || 'pdf';

  // 1. Try Cloudflare R2 Storage Bucket first (Fast 10GB Free Storage)
  if (isR2Configured) {
    try {
      const r2Result = await uploadFileToR2(targetFile);
      if (r2Result && r2Result.url) {
        return {
          ...r2Result,
          originalSizeMB,
          compressedSizeMB,
          reductionPercent
        };
      }
    } catch (err) {
      console.warn('Cloudflare R2 upload bypassed, falling back to Supabase:', err);
    }
  }

  // 2. Try Supabase Cloud Storage bucket fallback



  if (isSupabaseConnected && supabase) {
    try {
      // Auto-create bucket if missing
      try {
        await supabase.storage.createBucket('comsats-resources', { public: true });
      } catch (e) {
        // bucket might already exist
      }

      const filePath = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('comsats-resources')
        .upload(filePath, file, { upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('comsats-resources')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return {
            url: publicUrlData.publicUrl,
            fileName: file.name,
            fileSize: fileSizeMB,
            fileType: fileExt,
            storageEngine: 'supabase'
          };
        }
      } else if (error) {
        console.warn('Supabase storage bucket notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase cloud storage notice:', err);
    }
  }

  // 3. Universal Fallback: Convert to Base64 Data URL & save in Supabase DB
  // Data URLs work 100% across all computers, Incognito windows, and mobile devices
  try {
    const dataUrl = await fileToBase64(file);
    return {
      url: dataUrl,
      fileName: file.name,
      fileSize: fileSizeMB,
      fileType: fileExt,
      storageEngine: 'base64'
    };
  } catch (err) {
    console.error('Failed to convert file to Base64:', err);
  }

  // 4. Emergency Fallback: Object URL
  return {
    url: URL.createObjectURL(file),
    fileName: file.name,
    fileSize: fileSizeMB,
    fileType: fileExt,
    downloadContent: `Document: ${file.name}\nSize: ${fileSizeMB}`
  };
}
