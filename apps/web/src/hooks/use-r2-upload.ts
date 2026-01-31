"use client";

import { useCallback, useState } from "react";

const VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
];

export function useR2Upload() {
  const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(new Map());
  const [isUploading, setIsUploading] = useState(false);

  const uploadToR2 = useCallback(
    async (
      file: File,
      onProgress?: (progress: number) => void
    ): Promise<{ id: string; url: string } | null> => {
      const fileId = `r2-${Date.now()}-${file.name}`;

      try {
        setIsUploading(true);
        onProgress?.(5);
        setUploadProgress((prev) => new Map(prev).set(fileId, 5));

        const formData = new FormData();
        formData.append("file", file);

        const result = await new Promise<{ id: string; url: string }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 90) + 5;
              onProgress?.(percentComplete);
              setUploadProgress((prev) => new Map(prev).set(fileId, percentComplete));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve({ id: response.id, url: response.url });
              } catch {
                reject(new Error("Invalid server response"));
              }
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
          });

          xhr.open("POST", "/api/upload-video");
          xhr.send(formData);
        });

        onProgress?.(100);
        setUploadProgress((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });

        return result;
      } catch (error) {
        setUploadProgress((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const isVideoFile = useCallback((file: File) => {
    return VIDEO_TYPES.includes(file.type);
  }, []);

  return {
    uploadToR2,
    isVideoFile,
    isUploading,
    uploadProgress,
  };
}
