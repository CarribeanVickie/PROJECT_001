import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { getUploadsDir } from '../config/storage';

const PROFILE_UPLOAD_DIR = path.join(getUploadsDir(), 'profile-photos');

function getExtensionFromMimeType(mimeType: string) {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

export function saveBase64ProfilePhoto(userId: string, base64Payload: string, mimeType: string) {
  fs.mkdirSync(PROFILE_UPLOAD_DIR, { recursive: true });

  const normalizedBase64 = base64Payload.includes(',') ? base64Payload.split(',')[1] : base64Payload;
  const extension = getExtensionFromMimeType(mimeType);
  const fileName = `${userId}-${randomUUID()}.${extension}`;
  const absolutePath = path.join(PROFILE_UPLOAD_DIR, fileName);

  fs.writeFileSync(absolutePath, Buffer.from(normalizedBase64, 'base64'));

  return `/uploads/profile-photos/${fileName}`;
}
