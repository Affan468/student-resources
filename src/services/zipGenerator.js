import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getCachedFileAsync } from './fileCache';

/**
 * Generates a ZIP archive containing all resources for a specific instructor
 * @param {Object} instructor - Instructor object
 * @param {Object} course - Course object
 * @param {Array} resources - Array of resource objects belonging to this instructor
 * @param {Function} onProgress - Progress callback function (percentage)
 */
export async function downloadInstructorResourcesZip(instructor, course, resources, onProgress) {
  if (!resources || resources.length === 0) {
    throw new Error('No resources available to download for this instructor.');
  }

  const zip = new JSZip();

  // Create organized folders inside the ZIP file
  const pastPapersFolder = zip.folder('Past_Papers');
  const quizzesFolder = zip.folder('Quizzes');
  const assignmentsFolder = zip.folder('Assignments');
  const labAssignmentsFolder = zip.folder('Lab_Assignments');
  const labManualsFolder = zip.folder('Lab_Manuals');
  const lecturesFolder = zip.folder('Lectures');
  const otherFolder = zip.folder('Other_Notes');

  let processedCount = 0;

  for (const item of resources) {
    const targetFolder =
      item.category === 'past-paper' ? pastPapersFolder :
      item.category === 'quiz' ? quizzesFolder :
      item.category === 'assignment' ? assignmentsFolder :
      item.category === 'lab-assignment' ? labAssignmentsFolder :
      item.category === 'lab-manual' ? labManualsFolder :
      item.category === 'lecture' ? lecturesFolder : otherFolder;

    const cleanFileName = item.fileName || `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    // Check in-memory binary file cache or IndexedDB disk storage
    const cachedBinaryFile = (await getCachedFileAsync(item.id)) || item.rawFile;

    if (cachedBinaryFile && (cachedBinaryFile instanceof Blob || cachedBinaryFile instanceof File)) {
      targetFolder.file(cleanFileName, cachedBinaryFile);
    } else {
      const fileHeader = `====================================================\n` +
        `COMSATS UNIVERSITY ISLAMABAD - RESOURCE REPOSITORY\n` +
        `Course: ${course ? course.title + ' (' + course.code + ')' : 'N/A'}\n` +
        `Instructor: ${instructor ? instructor.name : 'N/A'}\n` +
        `Category: ${item.category.toUpperCase()}\n` +
        `Title: ${item.title}\n` +
        `Session/Semester: ${item.semesterSession || 'N/A'}\n` +
        `Exam Type: ${item.examType || 'N/A'}\n` +
        `Uploaded By: ${item.uploaderName || 'Anonymous Student'}\n` +
        `Date: ${item.createdAt}\n` +
        `====================================================\n\n`;

      const fileBody = item.downloadContent || `Document Content for: ${item.title}`;
      targetFolder.file(cleanFileName, fileHeader + fileBody);
    }

    processedCount++;
    if (onProgress) {
      onProgress(Math.round((processedCount / resources.length) * 100));
    }
  }

  // Generate the ZIP blob
  const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (onProgress) {
      onProgress(Math.round(metadata.percent));
    }
  });

  const zipName = `${instructor.name.replace(/[^a-zA-Z0-9]/g, '_')}_${course ? course.code : 'COMSATS'}_All_Resources.zip`;
  saveAs(zipBlob, zipName);
  return zipName;
}

/**
 * Download a category specific zip (e.g. all past papers of an instructor)
 */
export async function downloadCategoryZip(instructor, course, categoryName, resources) {
  if (!resources || resources.length === 0) {
    throw new Error(`No ${categoryName} available to download.`);
  }

  const zip = new JSZip();
  const folder = zip.folder(categoryName.replace(/\s+/g, '_'));

  for (const item of resources) {
    const cleanFileName = item.fileName || `${item.title.replace(/\s+/g, '_')}.pdf`;
    const cachedBinaryFile = (await getCachedFileAsync(item.id)) || item.rawFile;

    if (cachedBinaryFile && (cachedBinaryFile instanceof Blob || cachedBinaryFile instanceof File)) {
      folder.file(cleanFileName, cachedBinaryFile);
    } else {
      const fileHeader = `COMSATS RESOURCE HUB | ${categoryName.toUpperCase()}\n` +
        `Course: ${course?.title} (${course?.code})\n` +
        `Instructor: ${instructor?.name}\n` +
        `Title: ${item.title}\n\n`;

      const fileBody = item.downloadContent || `Content for ${item.title}`;
      folder.file(cleanFileName, fileHeader + fileBody);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipName = `${instructor.name.replace(/\s+/g, '_')}_${categoryName.replace(/\s+/g, '_')}.zip`;
  saveAs(zipBlob, zipName);
  return zipName;
}
