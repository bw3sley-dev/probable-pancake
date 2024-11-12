import { BadRequestError } from "@/errors/bad-request-error";
import { NotFoundError } from "@/errors/not-found-error";

import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import { compare } from "bcryptjs";

import type { FastifyInstance } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function changeEmail(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).patch("/account/change-email", {
        schema: {
            tags: ["Account"],
            summary: "Change account e-mail",
            security: [{ bearerAuth: [] }],
            body: z.object({
                email: z.string().email(),
                password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres")
            }),
            response: {
                204: z.null()
            }
        }
    }, async (request, reply) => {
        const { email, password } = request.body;

        const userId = await request.getCurrentUserId();

        const isEmailAlreadyBeingUsed = await prisma.member.findUnique({
            where: { email }
        })

        if (isEmailAlreadyBeingUsed) {
            return reply.status(204).send();
        }

        const user = await prisma.member.findUnique({
            where: { id: userId }
        })

        if (!user) {
            throw new NotFoundError("User not found");
        }

        if (user.email === email) {
            return reply.status(204).send();
        }

        const doesPasswordMatch = await compare(password, user.passwordHash);

        if (!doesPasswordMatch) {
            throw new BadRequestError("Invalid credentials");
        }

        await prisma.member.update({
            where: { id: userId },

            data: { email }
        })

        return reply.status(204).send();
    })
}