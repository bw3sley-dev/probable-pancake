import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function getAthletesAmount(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).get("/metrics/athletes-amount", {
        schema: {
            tags: ["Metrics"],
            summary: "Get the amount of active athletes",
            security: [{ bearerAuth: [] }],
            response: {
                200: z.object({
                    amount: z.number()
                })
            }
        }
    }, async (request, reply) => {
        const amount = await prisma.athlete.count({
            where: {
                deletedAt: null
            }
        });

        return reply.send({ amount: amount ?? 0 });
    })
}