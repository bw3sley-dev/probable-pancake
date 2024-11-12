import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function getAthletesByGenderAmount(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).get("/metrics/athletes-gender-amount", {
        schema: {
            tags: ["Metrics"],
            summary: "Get the amount of athletes by gender",
            security: [{ bearerAuth: [] }],
            response: {
                200: z.array(z.object({
                    gender: z.enum(["Masculino", "Feminino"]),
                    amount: z.number()
                }))
            }
        }
    }, async (request, reply) => {
        const totalMale = await prisma.athlete.count({
            where: {
                gender: "MALE",
                deletedAt: null
            }
        })

        const totalFemale = await prisma.athlete.count({
            where: {
                gender: "FEMALE",
                deletedAt: null
            }
        })

        return reply.send([
            {
                gender: "Masculino",
                amount: totalMale ?? 0       
            },

            {
                gender: "Feminino",
                amount: totalFemale ?? 0
            }
        ])
    })
}