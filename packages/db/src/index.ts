import { env } from "@marketingclickcannabis/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../prisma/generated/client";
import { queryAdsDb } from "./external-db";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const db = prisma;
export default prisma;
export { queryAdsDb };

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
  TagGroup,
  AdProjectStatus,
  AdVideoPhaseStatus,
  AdVideoTema,
  AdVideoEstilo,
  AdVideoFormato,
  AdDeliverableTempo,
  AdDeliverableTamanho,
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
  FieldValueVersion,
  WorkflowStep,
  ContentTypeAreaPermission,
  Creator,
  AdType,
  AdProject,
  AdVideo,
  AdDeliverable,
  AdCounter,
} from "../prisma/generated/client";
