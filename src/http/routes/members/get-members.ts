import { UnauthorizedError } from "@/errors/unauthorized-error";

import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function getMembers(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).get("/members", {
        schema: {
            tags: ["Members"],
            summary: "Get all members",
            security: [{ bearerAuth: [] }],
            querystring: z.object({
                pageIndex: z.coerce.number().min(0),
                memberName: z.string().optional(),
                role: z.enum(["all", "admin", "volunteer"]).default("all")
            }),
            response: {
                200: z.object({
                    members: z.array(
                        z.object({
                            id: z.string().uuid(),
                            name: z.string(),
                            email: z.string().email(),
                            role: z.enum(["ADMIN", "MEMBER"]),
                            avatarUrl: z.string().url().nullable(),
                            cpf: z.string().nullable(),
                            phone: z.string().nullable(),
                            gender: z.enum(["MALE", "FEMALE"]).nullable(),
                            birthDate: z.string().nullable(),
                            areas: z.array(z.enum([
                                "PSYCHOLOGY",
                                "PHYSIOTHERAPY",
                                "NUTRITION",
                                "NURSING",
                                "PSYCHOPEDAGOGY",
                                "PHYSICAL_EDUCATION"
                            ]))
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
        const { pageIndex, memberName, role } = request.query;

        const userId = await request.getCurrentUserId();

        const PAGE_SIZE = 10;

        const roleFilter = role === "admin" ? "ADMIN" : role === "volunteer" ? "MEMBER" : undefined;

        const members = await prisma.member.findMany({
            skip: pageIndex * PAGE_SIZE,
            take: PAGE_SIZE,

            where: {
                deleteAt: null,

                id: { not: userId },

                ...(memberName && {
                    name: { contains: memberName, mode: "insensitive" }
                }),

                ...(role !== "all" && { role: roleFilter })
            },

            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
                cpf: true,
                phone: true,
                gender: true,
                birthDate: true,

                areas: {
                    select: {
                        area: {
                            select: { name: true }
                        }
                    }
                }
            },

            orderBy: [
                { role: "desc" },
                { name: "asc" }
            ]
        })

        const memberCount = await prisma.member.count({
            where: {
                deleteAt: null,

                id: { not: userId },

                ...(memberName && {
                    name: { contains: memberName, mode: "insensitive" }
                }),

                ...(role !== "all" && { role: roleFilter })
            },
        })

        const result = {
            members: members.map(member => ({
                ...member,

                birthDate: member.birthDate?.toISOString() ?? null,

                areas: member.areas.map(item => (item.area.name)).filter(areaName => areaName !== "UNSPECIFIED")
            })),

            meta: {
                pageIndex,
                perPage: PAGE_SIZE,
                totalCount: memberCount
            }
        }

        return reply.send(result);
    })
}