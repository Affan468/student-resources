// Document & Image Compression Engine (20 MB Restriction + Ultra 90% Compression Pipeline)
import { PDFDocument, PDFName, PDFRawStream } from 'pdf-lib';

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB limit

/**
 * Validates if a file is within the 20 MB limit
 * @param {File} file 
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFileSize(file) {
  if (!file) return { valid: false, error: 'No file selected.' };
  
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMB} MB) exceeds the maximum allowed limit of 20 MB. Please select a smaller document.`
    };
  }

  return { valid: true };
}

/**
 * Ultra-High Ratio Canvas Image Compression (~90% size reduction target)
 * @param {File} file 
 * @param {number} quality 0.0 - 1.0 (default 0.35 for ~200 KB output targets)
 * @returns {Promise<File>}
 */
async function compressImageFile(file, quality = 0.35) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down large camera photos to 1024px max dimension for ultra-compact sizes
      const MAX_DIMENSION = 1024;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      // Apply grayscale filter for document pages to strip heavy RGB color data
      ctx.filter = 'grayscale(100%)';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Return original if compression didn't reduce size
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Ultra-Compress PDF documents to target ~200 KB file sizes
 * @param {File} file 
 * @returns {Promise<File>}
 */
async function compressPdfFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // Iterate through all indirect objects in the PDF context to find and ultra-compress embedded images
    const indirectObjects = pdfDoc.context.enumerateIndirectObjects();
    
    for (const [ref, obj] of indirectObjects) {
      if (obj instanceof PDFRawStream && obj.dict) {
        const subtype = obj.dict.get(PDFName.of('Subtype'));
        if (subtype === PDFName.of('Image')) {
          try {
            const filter = obj.dict.get(PDFName.of('Filter'));
            const imageBytes = obj.contents;

            // Process all image streams larger than 5 KB
            if (imageBytes && imageBytes.length > 5 * 1024) {
              const mimeType = (filter === PDFName.of('DCTDecode')) ? 'image/jpeg' : 'image/png';
              const blob = new Blob([imageBytes], { type: mimeType });
              const imgFile = new File([blob], 'embedded_img.jpg', { type: mimeType });

              // Ultra 35% JPEG quality grayscale stream compression
              const compressedImg = await compressImageFile(imgFile, 0.35);
              
              if (compressedImg && compressedImg.size < imageBytes.length) {
                const compressedBuffer = await compressedImg.arrayBuffer();
                obj.contents = new Uint8Array(compressedBuffer);
                obj.dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
                obj.dict.set(PDFName.of('Length'), pdfDoc.context.obj(compressedBuffer.byteLength));
              }
            }
          } catch (err) {
            console.warn('Embedded PDF image compression skipped for object:', err);
          }
        }
      }
    }

    // Save PDF using Object Stream Compression
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false
    });

    if (compressedBytes && compressedBytes.length < file.size) {
      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      return new File([blob], file.name, {
        type: 'application/pdf',
        lastModified: Date.now()
      });
    }
  } catch (e) {
    console.warn('PDF ultra compression fallback:', e);
  }
  return file;
}

/**
 * Main compression pipeline for uploads (Images + PDFs)
 * @param {File} file 
 * @returns {Promise<{ compressedFile: File, originalSizeMB: string, compressedSizeMB: string, reductionPercent: number }>}
 */
export async function compressDocumentFile(file) {
  if (!file) return { compressedFile: file, originalSizeMB: '0 MB', compressedSizeMB: '0 MB', reductionPercent: 0 };

  const originalSize = file.size;
  const originalSizeMB = (originalSize / (1024 * 1024)).toFixed(2) + ' MB';

  let resultFile = file;

  // 1. Image compression (JPEG, PNG, WebP)
  if (file.type.startsWith('image/')) {
    try {
      resultFile = await compressImageFile(file, 0.35);
    } catch (e) {
      console.warn('Image compression notice:', e);
    }
  } 
  // 2. PDF Document compression (Ultra 90% stream + image compression)
  else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    try {
      resultFile = await compressPdfFile(file);
    } catch (e) {
      console.warn('PDF compression notice:', e);
    }
  }

  const compressedSize = resultFile.size;
  const compressedSizeMB = (compressedSize / (1024 * 1024)).toFixed(2) + ' MB';
  const reductionPercent = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

  console.log(`[COMSATS Vault] Ultra 90% Compression complete: ${originalSizeMB} -> ${compressedSizeMB} (${reductionPercent}% saved)`);

  return {
    compressedFile: resultFile,
    originalSizeMB,
    compressedSizeMB,
    reductionPercent
  };
}
