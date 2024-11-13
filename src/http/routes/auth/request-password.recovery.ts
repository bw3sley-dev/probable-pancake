import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function requestPasswordRecover(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("/password/recover", {
        schema: {
            tags: ["Auth"],
            summary: "Get authenticated user profile",
            body: z.object({
                email: z.string().email()
            }),
            response: {
                201: z.null()
            }
        }
    }, async (request, reply) => {
        const { email } = request.body;

        const userFromEmail = await prisma.member.findUnique({
            where: { email, deleteAt: null }
        })

        if (!userFromEmail) {
            return reply.status(201).send();
        }

        const { id: code } = await prisma.token.create({
            data: {
                type: "PASSWORD_RECOVER",
                memberId: userFromEmail.id
            }
        })

        console.log("Password recover token: ", code);

        return reply.status(201).send();
    })
}