import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import { getAge } from "@/utils/get-age";

import dayjs from "dayjs";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function getAthletes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).get("/athletes", {
        schema: {
            tags: ["Athletes"],
            summary: "Get all athletes",
            security: [{ bearerAuth: [] }],
            querystring: z.object({
                pageIndex: z.coerce.number().min(0),
                athleteName: z.string().optional(),
                gender: z.enum(["all", "male", "female"]).default("all")
            }),
            response: {
                200: z.object({
                    athletes: z.array(
                        z.object({
                            id: z.string(),
                            name: z.string(),
                            age: z.number(),
                            gender: z.string(),
                            handedness: z.string(),
                            bloodType: z.string(),
                            birthDate: z.string(),
                        })
                    ),

                    meta: z.object({
                        pageIndex: z.coerce.number().default(0),
                        perPage: z.coerce.number().default(10),
                        totalCount: z.coerce.number()
                    })
                })
            }
        }
    }, async (request, reply) => {
        const { pageIndex, athleteName, gender } = request.query;

        const PAGE_SIZE = 10;

        const genderFilter = gender === "male" ? "MALE" : gender === "female" ? "FEMALE" : undefined;

        const athletes = await prisma.athlete.findMany({
            skip: pageIndex * PAGE_SIZE,
            take: PAGE_SIZE,

            where: {
                deletedAt: null,

                ...(athleteName && {
                    name: { contains: athleteName, mode: "insensitive" }
                }),

                ...(gender !== "all" && { gender: genderFilter })
            },

            select: {
                id: true,
                name: true,
                birthDate: true,
                handedness: true,
                gender: true,
                bloodType: true
            },

            orderBy: {
                name: "asc"
            }
        })

        const athleteCount = await prisma.athlete.count({
            where: {
                deletedAt: null,

                ...(athleteName && {
                    name: { contains: athleteName, mode: "insensitive" }
                }),

                ...(gender !== "all" && { gender: genderFilter })
            }
        })

        const result = {
            athletes: athletes.map(athlete => ({
                id: athlete.id,
                name: athlete.name,
                
                gender: athlete.gender,
                bloodType: athlete.bloodType,
                handedness: athlete.handedness,

                age: getAge(athlete.birthDate.toISOString()),
    
                birthDate: dayjs(athlete.birthDate).format("DD/MM/YYYY"),
            })),

            meta: {
                pageIndex,
                perPage: PAGE_SIZE,
                totalCount: athleteCount
            }
        }

        return reply.send(result);
    })
}