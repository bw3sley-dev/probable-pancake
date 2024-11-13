import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

import { prisma } from "@/lib/prisma";

import { auth } from "@/http/middlewares/auth";

import { NotFoundError } from "@/errors/not-found-error";

import { UnauthorizedError } from "@/errors/unauthorized-error";

export async function removeAthleteObservation(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).delete("/athletes/:athleteId/threads/:threadId/observations/:observationId", {
        schema: {
            tags: ["Athletes"],
            summary: "Remove an observation from a thread of an athlete",
            params: z.object({
                athleteId: z.string().uuid(),
                threadId: z.coerce.number(),
                observationId: z.coerce.number(),
            }),
            response: {
                204: z.null()
            }
        }
    }, async (request, reply) => {
        const { athleteId, threadId, observationId } = request.params;
        
        const userId = await request.getCurrentUserId();

        const observation = await prisma.observation.findUnique({
            where: { id: observationId },

            include: {
                thread: true,
            }
        })

        if (!observation || observation.thread.athleteId !== athleteId || observation.threadId !== threadId) {
            throw new NotFoundError("Observation not found for the specified thread and athlete");
        }

        if (observation.memberId !== userId) {
            throw new UnauthorizedError("You do not have permission to delete this observation");
        }

        await prisma.observation.delete({
            where: { id: observationId }
        })

        return reply.status(204).send();
    })
}
