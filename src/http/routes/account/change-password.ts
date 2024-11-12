import { BadRequestError } from "@/errors/bad-request-error";
import { NotFoundError } from "@/errors/not-found-error";

import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import { compare, hash } from "bcryptjs";

import type { FastifyInstance } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function changePassword(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).patch("/account/change-password", {
        schema: {
            tags: ["Account"],
            summary: "Change account password",
            security: [{ bearerAuth: [] }],
            body: z.object({
                currentPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
                newPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres")
            }),
            response: {
                204: z.null()
            }
        }
    }, async (request, reply) => {
        const { newPassword, currentPassword } = request.body;

        const userId = await request.getCurrentUserId();

        const user = await prisma.member.findUnique({
            where: { id: userId }
        })

        if (!user) {
            throw new NotFoundError("User not found");
        }

        const isPasswordTheSame = await compare(newPassword, user.passwordHash);

        if (isPasswordTheSame) {
            return reply.status(204).send()
        }

        const doesPasswordMatch = await compare(currentPassword, user.passwordHash);

        if (!doesPasswordMatch) {
            throw new BadRequestError("Invalid credentials");
        }

        const newPasswordHash = await hash(newPassword, 6);

        await prisma.member.update({
            where: { id: userId },

            data: {
                passwordHash: newPasswordHash
            }
        })
    })
}