/**
 * Client-side Cloudinary upload — same pattern as C:\Nithin repo:
 * 1) GET /api/upload-params/image or /api/upload-params/audio (signed params only, no file through server)
 * 2) POST file directly to Cloudinary (https://api.cloudinary.com/.../image/upload or .../video/upload)
 * 3) Use returned secure_url; caller can then POST to your save API with { name, src } if needed.
 */

export type UploadParams = {
  cloudName: string;
  apiKey: string;
  signature: string;
  timestamp: number;
  folder: string;
  resource_type: string;
};

/** Upload an image file; use endpoint /api/upload-params/image. Returns secure_url. */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const paramsRes = await fetch("/api/upload-params/image", {
    credentials: "same-origin",
  });
  if (!paramsRes.ok) {
    const err = await paramsRes.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Could not get upload params");
  }
  const params = (await paramsRes.json()) as UploadParams;

  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("api_key", params.apiKey);
  formData.append("timestamp", String(params.timestamp));
  formData.append("signature", params.signature);
  formData.append("folder", params.folder);
  formData.append("resource_type", params.resource_type);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`;
  const uploadRes = await fetch(uploadUrl, { method: "POST", body: formData });
  const uploadData = (await uploadRes.json().catch(() => ({}))) as {
    secure_url?: string;
    error?: { message?: string };
  };
  const src = uploadData.secure_url;
  if (!uploadRes.ok || !src) {
    throw new Error(uploadData.error?.message || "Upload to Cloudinary failed");
  }
  return src;
}

/** Upload an audio file; use endpoint /api/upload-params/audio. Returns secure_url. */
export async function uploadAudioToCloudinary(file: File): Promise<string> {
  const paramsRes = await fetch("/api/upload-params/audio", {
    credentials: "same-origin",
  });
  if (!paramsRes.ok) {
    const err = await paramsRes.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Could not get upload params");
  }
  const params = (await paramsRes.json()) as UploadParams;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", params.apiKey);
  formData.append("timestamp", String(params.timestamp));
  formData.append("signature", params.signature);
  formData.append("folder", params.folder);
  formData.append("resource_type", params.resource_type);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${params.cloudName}/raw/upload`;
  const uploadRes = await fetch(uploadUrl, { method: "POST", body: formData });
  const uploadData = (await uploadRes.json().catch(() => ({}))) as {
    secure_url?: string;
    error?: { message?: string };
  };
  const src = uploadData.secure_url;
  if (!uploadRes.ok || !src) {
    throw new Error(uploadData.error?.message || "Upload to Cloudinary failed");
  }
  return src;
}
