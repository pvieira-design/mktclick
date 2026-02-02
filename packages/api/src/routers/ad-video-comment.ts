import { z } from "zod";

import db from "@marketingclickcannabis/db";

import { protectedProcedure, router } from "../index";

export const adVideoCommentRouter = router({
  list: protectedProcedure
    .input(z.object({ videoId: z.string().cuid() }))
    .query(async ({ input }) => {
      return db.adVideoComment.findMany({
        where: { videoId: input.videoId },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string().cuid(),
        content: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const video = await db.adVideo.findUniqueOrThrow({
        where: { id: input.videoId },
        include: { project: { select: { currentPhase: true } } },
      });

      return db.adVideoComment.create({
        data: {
          videoId: input.videoId,
          userId: ctx.session.user.id,
          content: input.content,
          projectPhase: video.project.currentPhase,
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      });
    }),
});
