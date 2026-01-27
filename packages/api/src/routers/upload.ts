import { put } from '@vercel/blob';
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const uploadRouter = router({
  upload: protectedProcedure
    .input(z.object({
      filename: z.string(),
      contentType: z.string(),
      data: z.string(),
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.data, 'base64');
      const blob = await put(input.filename, buffer, {
        access: 'public',
        contentType: input.contentType,
      });
      return { url: blob.url, pathname: blob.pathname };
    }),

  getUploadUrl: protectedProcedure
    .input(z.object({
      filename: z.string(),
      contentType: z.string(),
    }))
    .query(async ({ input }) => {
      const blob = await put(input.filename, Buffer.alloc(0), {
        access: 'public',
        contentType: input.contentType,
      });
      return { uploadUrl: blob.url, pathname: blob.pathname };
    }),
});
