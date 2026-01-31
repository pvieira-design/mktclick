import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_API_KEY: z.string().optional(),
    CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
    CLOUDFLARE_R2_BUCKET: z.string().optional(),
    CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().optional(),
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().optional(),
    CLOUDFLARE_R2_PUBLIC_URL: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
