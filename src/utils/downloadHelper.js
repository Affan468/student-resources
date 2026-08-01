import { saveAs } from 'file-saver';
import { getCachedFileAsync } from '../services/fileCache';

/**
 * Triggers download of an individual resource item (PDF, DOCX, ZIP, etc.)
 * Works across page reloads using IndexedDB persistent storage
 */
export async function downloadSingleResource(resource) {
  if (!resource) return;

  const fileName = resource.fileName || `${resource.title}.pdf`;


  // 1. Check in-memory session or IndexedDB disk storage (survives page reloads)
  const cachedFile = (await getCachedFileAsync(resource.id)) || resource.rawFile;
  if (cachedFile && (cachedFile instanceof Blob || cachedFile instanceof File)) {
    saveAs(cachedFile, fileName);
    return;
  }

  // 2. If object URL (blob:http...) or Cloud URL exists, fetch & save as genuine Blob
  if (resource.url && (resource.url.startsWith('blob:') || resource.url.startsWith('http'))) {
    try {
      const response = await fetch(resource.url);
      const blob = await response.blob();
      saveAs(blob, fileName);
      return;
    } catch (e) {
      console.warn('URL fetch fallback, using direct link save:', e);
      saveAs(resource.url, fileName);
      return;
    }
  }

  // 3. Fallback for pre-seeded mock items
  const content = resource.downloadContent || 
    `COMSATS UNIVERSITY ISLAMABAD - STUDY RESOURCE PORTAL\n` +
    `====================================================\n` +
    `Title: ${resource.title}\n` +
    `Category: ${resource.category}\n` +
    `Exam Type: ${resource.examType || 'N/A'}\n` +
    `Semester: ${resource.semesterSession || 'N/A'}\n` +
    `Uploader: ${resource.uploaderName || 'Anonymous'}\n` +
    `Date: ${resource.createdAt}\n` +
    `====================================================\n\n` +
    `Verified Study Material Resource`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, fileName);
}
