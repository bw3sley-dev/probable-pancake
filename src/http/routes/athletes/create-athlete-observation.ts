import { NotFoundError } from "@/errors/not-found-error";

import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import { FastifyInstance } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function createAthleteObservation(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).post("/athletes/:athleteId/areas/:areaName/thread/observations", {
        schema: {
            tags: ["Athletes"],
            summary: "Create an observation for a thread in a given area of an athlete",
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
                ])
            }),
            body: z.object({
                content: z.string().nullable(),
            }),
            response: {
                201: z.null()
            }
        }
    }, async (request, reply) => {
        const { athleteId, areaName } = request.params;

        const { content } = request.body;
        
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
                areaId: area.id,
            }
        })

        if (!thread) {
            throw new NotFoundError("Thread not found");
        }

        await prisma.observation.create({
            data: {
                threadId: thread.id,
                content,
                memberId: userId,
            },

            include: {
                member: {
                    select: { id: true, name: true }
                }
            }
        })

        return reply.status(201).send();
    })
}