// Browser IndexedDB Binary Storage Engine
// Stores large binary files (PDFs, DOCX, ZIPs up to hundreds of MBs) persistently on disk across browser page reloads

const DB_NAME = 'COMSATS_RESOURCE_DB';
const DB_VERSION = 1;
const STORE_NAME = 'file_store';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.warn('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Save binary File/Blob to IndexedDB persistently
 */
export async function saveFileToIDB(fileId, fileBlob) {
  if (!fileId || !fileBlob) return;
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({
      id: fileId,
      blob: fileBlob,
      fileName: fileBlob.name || `${fileId}.pdf`,
      updatedAt: Date.now()
    });
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('Failed to save binary file to IndexedDB:', err);
  }
}

/**
 * Retrieve binary File/Blob from IndexedDB
 */
export async function getFileFromIDB(fileId) {
  if (!fileId) return null;
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(fileId);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(request.result ? request.result.blob : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Failed to load binary file from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete binary file from IndexedDB
 */
export async function deleteFileFromIDB(fileId) {
  if (!fileId) return;
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(fileId);
  } catch (err) {
    console.warn('Failed to delete file from IndexedDB:', err);
  }
}
