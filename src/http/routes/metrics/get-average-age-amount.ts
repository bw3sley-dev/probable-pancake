import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function getAverageAgeAmount(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).get("/metrics/average-age-amount", {
        schema: {
            tags: ["Metrics"],
            summary: "Get the average age of athletes",
            security: [{ bearerAuth: [] }],
            response: {
                200: z.object({
                    amount: z.number()
                })
            }
        }
    }, async (request, reply) => {
        const athletes = await prisma.athlete.findMany({
            where: {
                deletedAt: null
            },

            select: {
                birthDate: true
            }
        })

        const currentDate = new Date();

        const totalAge = athletes.reduce((sum, athlete) => {
            const age = currentDate.getFullYear() - athlete.birthDate.getFullYear();
            
            return sum + age;
        }, 0)

        const averageAge = athletes.length > 0 ? totalAge / athletes.length : 0;

        return reply.send({ amount: averageAge ?? 0 });
    })
}