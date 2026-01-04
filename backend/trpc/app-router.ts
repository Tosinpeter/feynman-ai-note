import { createTRPCRouter } from "@/backend/trpc/create-context";
import { exampleRouter } from "@/backend/trpc/routes/example";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
});

export type AppRouter = typeof appRouter;
