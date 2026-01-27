import { env } from "@marketingclickcannabis/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const db = prisma;
export default prisma;

// Re-export enums and types for use in other packages
export {
  RequestStatus,
  ContentType,
  RequestOrigin,
  Patologia,
  Priority,
  RequestAction,
} from "../prisma/generated/enums";

export type {
  Request,
  RequestHistory,
  User,
} from "../prisma/generated/client";
