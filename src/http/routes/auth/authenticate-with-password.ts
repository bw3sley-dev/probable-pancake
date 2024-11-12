import { BadRequestError } from "@/errors/bad-request-error";

import { prisma } from "@/lib/prisma";

import { compare } from "bcryptjs";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function authenticateWithPassword(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("/sessions", {
        schema: {
            tags: ["Auth"],
            summary: "Authenticate with e-mail and password",
            body: z.object({
                email: z.string().email(),
                password: z.string()
            }),
            response: {
                201: z.object({
                    token: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const { email, password } = request.body;

        const userFromEmail = await prisma.member.findUnique({
            where: { email },

            include: {
                areas: {
                    select: {
                        area: {
                            select: { name: true }
                        }
                    }
                }
            }
        })

        if (!userFromEmail) {
            throw new BadRequestError("Invalid credentials.");
        }

        const isPasswordValid = await compare(
            password,
            userFromEmail.passwordHash,
        )

        if (!isPasswordValid) {
            throw new BadRequestError("Invalid credentials.");
        }

        const token = await reply.jwtSign(
            {
                sub: userFromEmail.id,
                role: userFromEmail.role,
                area: userFromEmail.areas
            },

            {
                sign: {
                    expiresIn: "7d",
                },
            },
        )

        return reply.status(201).send({ token });
    })
}