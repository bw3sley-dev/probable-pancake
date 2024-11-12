import { BadRequestError } from "@/errors/bad-request-error";

import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function getProfile(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).get("/profile", {
        schema: {
            tags: ["Auth"],
            summary: "Get authenticated user profile",
            security: [{ bearerAuth: [] }],
            response: {
                200: z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                    email: z.string().email(),
                    role: z.enum(["ADMIN", "MEMBER"]),
                    avatarUrl: z.string().url().nullable(),
                    cpf: z.string().nullable(),
                    phone: z.string().nullable(),
                    gender: z.enum(["MALE", "FEMALE"]).nullable(),
                    birthDate: z.string().nullable(),
                    areas: z.array(z.object({
                        name: z.enum([
                            "UNSPECIFIED",
                            "PSYCHOLOGY",
                            "PHYSIOTHERAPY",
                            "NUTRITION",
                            "NURSING",
                            "PSYCHOPEDAGOGY",
                            "PHYSICAL_EDUCATION"
                        ])
                    }))
                })
            }
        }
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();

        const user = await prisma.member.findUnique({
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

            where: {
                id: userId
            }
        })

        if (!user) {
            throw new BadRequestError("User not found");
        }

        const areas = user.areas.map(item => ({ name: item.area.name }));

        return reply.send({ 
            ...user, 

            birthDate: user.birthDate ? dayjs(user.birthDate).format("DD/MM/YYYY") : null, 
            
            areas 
        });
    })
}