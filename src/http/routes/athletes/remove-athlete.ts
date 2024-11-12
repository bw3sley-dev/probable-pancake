import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function removeAthlete(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).delete("/athletes/:athleteId", {
        schema: {
            tags: ["Athletes"],
            summary: "Remove an athlete",
            security: [{ bearerAuth: [] }],
            params: z.object({
                athleteId: z.string().uuid()
            }),
            response: {
                204: z.null()
            }
        }
    }, async (request, reply) => {
        const { athleteId } = request.params;

        await prisma.athlete.update({
            where: {
                id: athleteId
            },

            data: {
                deletedAt: new Date()
            }
        })

        return reply.status(204).send();
    })
}