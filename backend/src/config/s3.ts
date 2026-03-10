import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.AWS_S3_BUCKET || '';

export async function uploadToS3(
  fileBuffer: Buffer,
  mimeType: string,
  folder: string = 'profile-pictures',
): Promise<string> {
  const ext = mimeType.split('/')[1] || 'jpg';
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    }),
  );

  // Return the public URL (bucket must have appropriate access policy)
  return `https://${BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
}

export async function deleteFromS3(url: string): Promise<void> {
  try {
    const urlObj = new URL(url);
    const key = urlObj.pathname.slice(1); // Remove leading /
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
        
      }),
    );
  } catch {
    // Silently fail — the old file may not exist
  }
}
