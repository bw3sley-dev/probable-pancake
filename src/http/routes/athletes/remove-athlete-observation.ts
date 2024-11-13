import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

import { prisma } from "@/lib/prisma";

import { auth } from "@/http/middlewares/auth";

import { NotFoundError } from "@/errors/not-found-error";

import { UnauthorizedError } from "@/errors/unauthorized-error";

export async function removeAthleteObservation(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).delete("/athletes/:athleteId/areas/:areaName/observations/:observationId", {
        schema: {
            tags: ["Threads"],
            summary: "Remove an observation from a thread of an athlete",
            params: z.object({
                athleteId: z.string().uuid(),
                areaName: z.enum([
                    "UNSPECIFIED",
                    "PSYCHOLOGY",
                    "PHYSIOTHERAPY",
                    "NUTRITION",
                    "NURSING",
                    "PSYCHOPEDAGOGY",
                    "PHYSICAL_EDUCATION",
                ]),
                observationId: z.coerce.number(),
            }),
            response: {
                204: z.null()
            }
        }
    }, async (request, reply) => {
        const { athleteId, areaName, observationId } = request.params;
        
        const userId = await request.getCurrentUserId();

        const area = await prisma.area.findUnique({
            where: { name: areaName }
        })

        if (!area) {
            throw new NotFoundError("Area not found");
        }

        const thread = await prisma.thread.findFirst({
            where: {
                athleteId,
                areaId: area.id
            }
        })

        if (!thread) {
            throw new NotFoundError("Thread not found for the specified area and athlete");
        }

        const observation = await prisma.observation.findUnique({
            where: { id: observationId },

            include: {
                thread: true,
            }
        })

        if (!observation || observation.thread.athleteId !== athleteId || observation.threadId !== thread.id) {
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
