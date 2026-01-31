import { put } from '@vercel/blob';
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import db from "@marketingclickcannabis/db";
import { protectedProcedure, router } from "../index";

const importFileSchema = z.object({
  fileId: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  accessToken: z.string(),
});

async function downloadFromGoogleDrive(fileId: string, accessToken: string, mimeType: string): Promise<Buffer> {
  let downloadUrl: string;
  
  if (mimeType.startsWith('application/vnd.google-apps.')) {
    const exportMimeType = getExportMimeType(mimeType);
    downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`;
  } else {
    downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  }

  const response = await fetch(downloadUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to download file: ${response.status} - ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function getExportMimeType(googleMimeType: string): string {
  const exportMap: Record<string, string> = {
    'application/vnd.google-apps.document': 'application/pdf',
    'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.google-apps.presentation': 'application/pdf',
    'application/vnd.google-apps.drawing': 'image/png',
  };
  return exportMap[googleMimeType] || 'application/pdf';
}

function getExportedFileName(fileName: string, originalMimeType: string): string {
  const exportedMimeType = getExportMimeType(originalMimeType);
  const extensionMap: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'image/png': '.png',
  };
  const extension = extensionMap[exportedMimeType] || '.pdf';
  
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}${extension}`;
}

function getExportedMimeType(originalMimeType: string): string {
  if (originalMimeType.startsWith('application/vnd.google-apps.')) {
    return getExportMimeType(originalMimeType);
  }
  return originalMimeType;
}

export const googleDriveRouter = router({
  importFile: protectedProcedure
    .input(importFileSchema)
    .mutation(async ({ ctx, input }) => {
      const { fileId, fileName, mimeType, accessToken } = input;

      try {
        const buffer = await downloadFromGoogleDrive(fileId, accessToken, mimeType);
        
        const finalFileName = mimeType.startsWith('application/vnd.google-apps.')
          ? getExportedFileName(fileName, mimeType)
          : fileName;
        
        const finalMimeType = getExportedMimeType(mimeType);

        const blob = await put(finalFileName, buffer, {
          access: 'public',
          contentType: finalMimeType,
        });

        const file = await db.file.create({
          data: {
            name: finalFileName,
            originalName: fileName,
            description: `Imported from Google Drive`,
            url: blob.url,
            pathname: blob.pathname,
            size: buffer.length,
            mimeType: finalMimeType,
            uploadedById: ctx.session.user.id,
          },
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return {
          success: true,
          file,
        };
      } catch (error) {
        console.error('Error importing from Google Drive:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to import file from Google Drive",
        });
      }
    }),

  importMultiple: protectedProcedure
    .input(z.object({
      files: z.array(importFileSchema),
    }))
    .mutation(async ({ ctx, input }) => {
      const results: Array<{ success: boolean; fileName: string; fileId?: string; error?: string }> = [];

      for (const fileInput of input.files) {
        try {
          const buffer = await downloadFromGoogleDrive(fileInput.fileId, fileInput.accessToken, fileInput.mimeType);
          
          const finalFileName = fileInput.mimeType.startsWith('application/vnd.google-apps.')
            ? getExportedFileName(fileInput.fileName, fileInput.mimeType)
            : fileInput.fileName;
          
          const finalMimeType = getExportedMimeType(fileInput.mimeType);

          const blob = await put(finalFileName, buffer, {
            access: 'public',
            contentType: finalMimeType,
          });

          const file = await db.file.create({
            data: {
              name: finalFileName,
              originalName: fileInput.fileName,
              description: `Imported from Google Drive`,
              url: blob.url,
              pathname: blob.pathname,
              size: buffer.length,
              mimeType: finalMimeType,
              uploadedById: ctx.session.user.id,
            },
          });

          results.push({
            success: true,
            fileName: fileInput.fileName,
            fileId: file.id,
          });
        } catch (error) {
          results.push({
            success: false,
            fileName: fileInput.fileName,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        results,
        totalSuccess: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length,
      };
    }),
});
