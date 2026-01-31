import { env } from "@marketingclickcannabis/env/server";
import { protectedProcedure, router } from "../index";

const isR2Configured = Boolean(
  env.CLOUDFLARE_ACCOUNT_ID &&
  env.CLOUDFLARE_R2_BUCKET &&
  env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
  env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
);

export const r2Router = router({
  isConfigured: protectedProcedure.query(() => {
    return { configured: isR2Configured };
  }),
});
