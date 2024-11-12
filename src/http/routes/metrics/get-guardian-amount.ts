import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function getGuardiansAmount(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).get("/metrics/guardians-amount", {
        schema: {
            tags: ["Metrics"],
            summary: "Get the amount of guardians",
            security: [{ bearerAuth: [] }],
            response: {
                200: z.object({
                    amount: z.number()
                })
            }
        }
    }, async (request, reply) => {
        const amount = await prisma.guardian.count({
            where: {
                name: {
                    not: null
                }
            }
        });

        return reply.send({ amount: amount ?? 0 });
    })
}