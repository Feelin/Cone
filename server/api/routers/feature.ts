import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { generateSummary } from "@/pages/api/summary";

export const featureRouter = createTRPCRouter({
  query: publicProcedure.input(z.object({ product: z.string(), status: z.array(z.number()).optional() })).query(async ({ ctx, input }) => {
    const conditions: any = {
      product: input.product,
    }
    if (input.status && input.status.length) {
      conditions.status = {
        in: input.status
      }
    }
    const features = await ctx.db.feature.findMany({
      where: conditions,
      orderBy: { created_at: "desc" },
    });

    return features ?? null;
  }),

  generateSummaryById: publicProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    const feature = await ctx.db.feature.findUnique({
      where: {
        id: input
      }
    })
    const summary = await generateSummary(feature?.title, feature?.content);
    const result = await ctx.db.feature.update({
      where: {
        id: input,
      },
      data: {
        summary
      }
    });
    return result;
  }),

  updateStatus: publicProcedure.input(z.object({ id: z.bigint(), status: z.number() })).mutation(async ({ ctx, input }) => {
    const result = await ctx.db.feature.update({
      where: {
        id: input.id,
      },
      data: {
        status: input.status
      }
    });
    return result;
  }),

  setComment: publicProcedure.input(z.object({ id: z.bigint(), comment: z.string() })).mutation(async ({ ctx, input }) => {
    const result = await ctx.db.feature.update({
      where: {
        id: input.id,
      },
      data: {
        comment: input.comment
      }
    });
    return result;
  }),
});
