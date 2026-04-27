import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { randomUUID } from 'crypto';

const s3 = new S3Client({
  region: env.aws.region,
  credentials: {
    accessKeyId: env.aws.accessKeyId,
    secretAccessKey: env.aws.secretAccessKey,
  },
});

export const uploadBuffer = async ({ buffer, mimeType, folder = 'uploads' }) => {
  const key = `${folder}/${randomUUID()}`;
  const command = new PutObjectCommand({
    Bucket: env.aws.bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read',
  });
  await s3.send(command);
  return `https://${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com/${key}`;
};





