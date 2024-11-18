import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

import { NotFoundError } from "@/errors/not-found-error";

import { UnauthorizedError } from "@/errors/unauthorized-error";

export async function updateAthleteObservation(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).put("/athletes/:athleteId/areas/:areaName/thread/observations/:observationId", {
        schema: {
            tags: ["Observation"],
            summary: "Update an observation for a given thread of an athlete's area",
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
                observationId: z.coerce.number()
            }),
            body: z.object({
                content: z.string()
            }),
            response: {
                204: z.null()
            }
        }
    }, async (request, reply) => {
        const { athleteId, areaName, observationId } = request.params;

        const { content } = request.body;
        
        const userId = await request.getCurrentUserId();

        const area = await prisma.area.findUnique({
            where: { name: areaName },
        })

        if (!area) {
            throw new NotFoundError("Área não encontrada");
        }

        const thread = await prisma.thread.findFirst({
            where: {
                athleteId,
                areaId: area.id,
            },
        });

        if (!thread) {
            throw new NotFoundError("Thread não encontrada para a área e atleta");
        }

        const observation = await prisma.observation.findUnique({
            where: { id: observationId },
        })


        if (!observation) {
            throw new NotFoundError("Observação não encontrada");
        }

        if (observation.memberId !== userId) {
            throw new UnauthorizedError("Você não tem permissão para atualizar essa observação");
        }

        await prisma.observation.update({
            where: { id: observationId },
            data: { content }
        })

        return reply.status(204).send();
    })
}
