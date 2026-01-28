import { env } from "@marketingclickcannabis/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const db = prisma;
export default prisma;

// Re-export enums for use in other packages
export {
  RequestStatus,
  Patologia,
  Priority,
  RequestAction,
  UserRole,
  AreaPosition,
  FieldType,
  CreatorType,
} from "../prisma/generated/enums";

// Re-export types
export type {
  Request,
  RequestHistory,
  User,
  ContentType,
  Origin,
  Area,
  AreaMember,
  ContentTypeField,
  RequestFieldValue,
  WorkflowStep,
  ContentTypeAreaPermission,
  Creator,
} from "../prisma/generated/client";
