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
            throw new NotFoundError("Área não encontrada");
        }

        const thread = await prisma.thread.findFirst({
            where: {
                athleteId,
                areaId: area.id
            }
        })

        if (!thread) {
            throw new NotFoundError("Thread não encontrada para a área e atleta");
        }

        const observation = await prisma.observation.findUnique({
            where: { id: observationId },

            include: {
                thread: true,
            }
        })

        if (!observation) {
            throw new NotFoundError("Observação não encontrada");
        }

        if (observation.memberId !== userId) {
            throw new UnauthorizedError("Você não tem permissão para deletar essa observação");
        }

        await prisma.observation.delete({
            where: { id: observationId }
        })

        return reply.status(204).send();
    })
}
