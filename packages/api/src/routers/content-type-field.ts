import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db, { FieldType } from "@marketingclickcannabis/db";

import { adminProcedure, publicProcedure, router } from "../index";

export const contentTypeFieldRouter = router({
  listByContentType: publicProcedure
    .input(z.object({ contentTypeId: z.string().cuid() }))
    .query(async ({ input }) => {
      const fields = await db.contentTypeField.findMany({
        where: {
          contentTypeId: input.contentTypeId,
          isActive: true,
        },
        orderBy: { order: "asc" },
      });
      return { items: fields };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      const field = await db.contentTypeField.findUnique({
        where: { id: input.id },
      });
      if (!field) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ContentTypeField not found",
        });
      }
      return field;
    }),

  create: adminProcedure
    .input(
      z.object({
        contentTypeId: z.string().cuid(),
        name: z.string().regex(/^[a-z][a-z0-9_]*$/),
        label: z.string().min(1).max(200),
        fieldType: z.nativeEnum(FieldType),
        required: z.boolean().default(false),
        order: z.number().int().default(0),
        options: z.array(z.string()).optional(),
        placeholder: z.string().optional(),
        helpText: z.string().optional(),
        defaultValue: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const contentType = await db.contentType.findUnique({
        where: { id: input.contentTypeId },
      });
      if (!contentType) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ContentType not found",
        });
      }

      const existingField = await db.contentTypeField.findUnique({
        where: {
          contentTypeId_name: {
            contentTypeId: input.contentTypeId,
            name: input.name,
          },
        },
      });
      if (existingField) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Field name already exists for this content type",
        });
      }

      const field = await db.contentTypeField.create({
        data: {
          contentTypeId: input.contentTypeId,
          name: input.name,
          label: input.label,
          fieldType: input.fieldType,
          required: input.required,
          order: input.order,
          options: input.options || undefined,
          placeholder: input.placeholder,
          helpText: input.helpText,
          defaultValue: input.defaultValue,
          isActive: true,
        },
      });
      return field;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        label: z.string().min(1).max(200).optional(),
        required: z.boolean().optional(),
        order: z.number().int().optional(),
        options: z.array(z.string()).optional(),
        placeholder: z.string().optional(),
        helpText: z.string().optional(),
        defaultValue: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const field = await db.contentTypeField.findUnique({
        where: { id: input.id },
      });
      if (!field) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ContentTypeField not found",
        });
      }

      const updated = await db.contentTypeField.update({
        where: { id: input.id },
        data: {
          label: input.label,
          required: input.required,
          order: input.order,
          options: input.options || undefined,
          placeholder: input.placeholder,
          helpText: input.helpText,
          defaultValue: input.defaultValue,
          isActive: input.isActive,
        },
      });
      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const field = await db.contentTypeField.findUnique({
        where: { id: input.id },
      });
      if (!field) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ContentTypeField not found",
        });
      }

      const fieldValueCount = await db.requestFieldValue.count({
        where: { fieldId: input.id },
      });

      if (fieldValueCount > 0) {
        await db.contentTypeField.update({
          where: { id: input.id },
          data: { isActive: false },
        });
        return { deleted: false, deactivated: true };
      } else {
        await db.contentTypeField.delete({
          where: { id: input.id },
        });
        return { deleted: true, deactivated: false };
      }
    }),

  reorder: adminProcedure
    .input(
      z.object({
        contentTypeId: z.string().cuid(),
        fieldIds: z.array(z.string().cuid()),
      })
    )
    .mutation(async ({ input }) => {
      const contentType = await db.contentType.findUnique({
        where: { id: input.contentTypeId },
      });
      if (!contentType) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ContentType not found",
        });
      }

      const updates = input.fieldIds.map((fieldId, index) =>
        db.contentTypeField.update({
          where: { id: fieldId },
          data: { order: index },
        })
      );

      const updated = await Promise.all(updates);
      return { items: updated };
    }),
});
