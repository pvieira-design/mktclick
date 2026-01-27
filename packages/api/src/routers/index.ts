import { protectedProcedure, publicProcedure, router } from "../index";
import { requestRouter } from "./request";

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
  request: requestRouter,
});
export type AppRouter = typeof appRouter;
