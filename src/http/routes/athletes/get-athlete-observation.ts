import { NotFoundError } from "@/errors/not-found-error";

import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function getAthleteObservation(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).get("/athletes/:athleteId/areas/:areaName/thread/observations", {
        schema: {
            tags: ["Threads"],
            summary: "Get the thread observations for a given area of an athlete",
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
            }),
            querystring: z.object({
                pageIndex: z.coerce.number().min(0).default(0),
            }),
            response: {
                200: z.object({
                    thread: z.object({
                        id: z.number(),
                        
                        observations: z.array(
                            z.object({
                                id: z.number(),
                                
                                content: z.string().nullable(),
                                edited: z.boolean(),
                                
                                createdAt: z.string(),
                                
                                member: z.object({
                                    id: z.string().uuid(),
                                    name: z.string(),
                                }),
                            })
                        ),

                        createdAt: z.string(),
                    }).nullable(),
                }),
            },
        },
    }, async (request, reply) => {
        const { athleteId, areaName } = request.params;

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
            },

            include: {
                observations: {
                    include: {
                        member: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },

            orderBy: {
                createdAt: "asc",
            },
        });

        if (!thread) {
            return reply.send({ thread: null });
        }

        const response = {
            thread: {
                id: thread.id,

                observations: thread.observations.map((observation) => ({
                    id: observation.id,

                    content: observation.content,
                    edited: observation.createdAt.getTime() !== observation.updatedAt?.getTime(),

                    createdAt: observation.createdAt.toISOString(),

                    member: {
                        id: observation.member.id,
                        name: observation.member.name,
                    },
                })) ?? [],

                createdAt: thread.createdAt.toISOString(),
            },
        };

        return reply.send(response);
    });
}
