import { protectedProcedure, publicProcedure, router } from "../index";
import { adsRouter } from "./ads";
import { areaRouter } from "./area";
import { contentTypeRouter } from "./content-type";
import { contentTypeFieldRouter } from "./content-type-field";
import { creatorRouter } from "./creator";
import { fileRouter } from "./file";
import { fileTagRouter } from "./file-tag";
import { googleDriveRouter } from "./google-drive";
import { originRouter } from "./origin";
import { r2Router } from "./r2";
import { requestRouter } from "./request";
import { uploadRouter } from "./upload";
import { userRouter } from "./user";
import { workflowRouter } from "./workflow";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  ads: adsRouter,
  area: areaRouter,
  request: requestRouter,
  contentType: contentTypeRouter,
  contentTypeField: contentTypeFieldRouter,
  creator: creatorRouter,
  file: fileRouter,
  fileTag: fileTagRouter,
  googleDrive: googleDriveRouter,
  origin: originRouter,
  r2: r2Router,
  upload: uploadRouter,
  user: userRouter,
  workflow: workflowRouter,
});
export type AppRouter = typeof appRouter;
