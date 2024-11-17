import { NotFoundError } from "@/errors/not-found-error";

import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function updateAccount(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).put("/account", {
        schema: {
            tags: ["Account"],
            summary: "Update account",
            security: [{ bearerAuth: [] }],
            body: z.object({
                name: z.string().min(1, "Nome é obrigatório"),
                cpf: z.string().nullable(),
                birthDate: z.preprocess((arg) => {
                    if (typeof arg === "string") {
                        return new Date(arg);
                    }
                    
                    return arg;
                }, z.date()).nullable(),
                gender: z.enum(["MALE", "FEMALE"]).nullable(),
                phone: z.string().nullable()
            }),
            response: {
                204: z.null()
            }

        }
    }, async (request, reply) => {
        const { name, phone, gender, cpf, birthDate } = request.body;

        const userId = await request.getCurrentUserId();

        const user = await prisma.member.findUnique({
            where: { id: userId }
        })

        if (!user) {
            throw new NotFoundError("Usuário não encontrado");
        }

        await prisma.member.update({
            where: { id: userId },

            data: {
                name,
                phone,
                gender,
                cpf,
                birthDate
            }
        })        

        return reply.status(204).send();
    })
}