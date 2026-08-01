// Binary File Cache & IndexedDB Persistent Synchronization Engine
import { saveFileToIDB, getFileFromIDB } from './indexedDBStorage';

const fileBlobCache = new Map();

/**
 * Save a binary File/Blob in the session cache and disk IndexedDB
 */
export function cacheFile(fileId, file) {
  if (fileId && file) {
    fileBlobCache.set(fileId, file);
    // Persist to disk via IndexedDB
    saveFileToIDB(fileId, file).catch(err => {
      console.warn('IDB background save error:', err);
    });
  }
}

/**
 * Retrieve a binary File/Blob (sync from RAM cache or async from IndexedDB)
 */
export function getCachedFile(fileId) {
  if (!fileId) return null;
  return fileBlobCache.get(fileId) || null;
}

/**
 * Async fetch for stored binary file (used when page is reloaded)
 */
export async function getCachedFileAsync(fileId) {
  if (!fileId) return null;
  if (fileBlobCache.has(fileId)) {
    return fileBlobCache.get(fileId);
  }
  // Try loading from persistent disk IndexedDB after page reload
  const blobFromDisk = await getFileFromIDB(fileId);
  if (blobFromDisk) {
    fileBlobCache.set(fileId, blobFromDisk);
    return blobFromDisk;
  }
  return null;
}
