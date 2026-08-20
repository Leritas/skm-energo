export const PHOTO_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

export type PhotoMimeType = (typeof PHOTO_MIME_TYPES)[number];
export type DocumentMimeType = (typeof DOCUMENT_MIME_TYPES)[number];

export const PHOTO_MAX_BYTES = 25 * 1024 * 1024;
export const DOCUMENT_MAX_BYTES = 50 * 1024 * 1024;

const PHOTO_MIME_SET = new Set<string>(PHOTO_MIME_TYPES);
const DOCUMENT_MIME_SET = new Set<string>(DOCUMENT_MIME_TYPES);

const MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    '.docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    '.xlsx',
};

export function isPhotoMimeType(mimeType: string): mimeType is PhotoMimeType {
  return PHOTO_MIME_SET.has(mimeType);
}

export function isDocumentMimeType(
  mimeType: string,
): mimeType is DocumentMimeType {
  return DOCUMENT_MIME_SET.has(mimeType);
}

export function extensionForMimeType(mimeType: string): string {
  const extension = MIME_EXTENSION[mimeType];
  if (!extension) {
    throw new Error(`Unsupported mime type: ${mimeType}`);
  }
  return extension;
}

export type MediaOwnerRef =
  | { productId: number }
  | { newsArticleId: number }
  | { categoryId: number };

export function assertSingleOwner(owner: MediaOwnerRef): void {
  const keys = Object.keys(owner);
  if (keys.length !== 1) {
    throw new Error('Exactly one owner foreign key is required');
  }
}
