import { UnauthorizedError } from "@/errors/unauthorized-error";

import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function removeMember(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).delete("/members/:memberId", {
        schema: {
            tags: ["Members"],
            summary: "Remove a member",
            security: [{ bearerAuth: [] }],
            params: z.object({
                memberId: z.string().uuid()
            }),
            response: {
                204: z.null()
            }
        }
    }, async (request, reply) => {
        const { memberId } = request.params;

        await prisma.$transaction([
            prisma.memberArea.deleteMany({
                where: { memberId }
            }),

            prisma.member.update({
                where: { id: memberId },

                data: {
                    deleteAt: new Date()
                }
            })
        ])


        return reply.status(204).send();
    })
}