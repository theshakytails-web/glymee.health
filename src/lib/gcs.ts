import { Storage } from "@google-cloud/storage";

const bucketName = process.env.GCS_BUCKET_NAME || "glymee-reports";

function getStorageClient(): Storage | null {
  const credentials = process.env.GCS_CREDENTIALS;
  if (!credentials) return null;
  try {
    return new Storage({
      credentials: JSON.parse(credentials),
    });
  } catch {
    return null;
  }
}

export async function uploadPdf(
  fileName: string,
  buffer: Buffer
): Promise<string | null> {
  const storage = getStorageClient();
  if (!storage) return null;

  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    await file.save(buffer, {
      contentType: "application/pdf",
      resumable: false,
    });
    return fileName;
  } catch (err) {
    console.error("GCS upload error:", err);
    return null;
  }
}

export async function downloadPdf(fileName: string): Promise<Buffer | null> {
  const storage = getStorageClient();
  if (!storage) return null;

  try {
    const bucket = storage.bucket(bucketName);
    const [buffer] = await bucket.file(fileName).download();
    return buffer;
  } catch (err) {
    console.error("GCS download error:", err);
    return null;
  }
}

export async function deletePdf(fileName: string): Promise<boolean> {
  const storage = getStorageClient();
  if (!storage) return false;

  try {
    const bucket = storage.bucket(bucketName);
    await bucket.file(fileName).delete();
    return true;
  } catch {
    return false;
  }
}
