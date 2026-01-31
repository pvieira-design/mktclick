import { put, del } from '@vercel/blob';
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import db from "@marketingclickcannabis/db";
import { protectedProcedure, router } from "../index";

const BLOCKED_EXTENSIONS = ['.exe', '.sh', '.bat', '.cmd', '.ps1', '.vbs', '.msi', '.scr', '.com'];

function isBlockedFileType(filename: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return BLOCKED_EXTENSIONS.includes(ext);
}

export const uploadRouter = router({
  upload: protectedProcedure
    .input(z.object({
      filename: z.string(),
      contentType: z.string(),
      data: z.string(),
      description: z.string().optional(),
      tagIds: z.array(z.string().cuid()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (isBlockedFileType(input.filename)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File type not allowed. Blocked extensions: ${BLOCKED_EXTENSIONS.join(', ')}`,
        });
      }

      const buffer = Buffer.from(input.data, 'base64');
      const blob = await put(input.filename, buffer, {
        access: 'public',
        contentType: input.contentType,
        addRandomSuffix: true,
      });

      const file = await db.file.create({
        data: {
          name: input.filename,
          originalName: input.filename,
          description: input.description,
          url: blob.url,
          pathname: blob.pathname,
          size: buffer.length,
          mimeType: input.contentType,
          uploadedById: ctx.session.user.id,
          ...(input.tagIds && input.tagIds.length > 0 && {
            tags: {
              create: input.tagIds.map(tagId => ({
                tagId,
              })),
            },
          }),
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
        url: blob.url,
        pathname: blob.pathname,
        id: file.id,
        file,
      };
    }),

  delete: protectedProcedure
    .input(z.object({
      url: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      await del(input.url);
      return { success: true };
    }),
});
