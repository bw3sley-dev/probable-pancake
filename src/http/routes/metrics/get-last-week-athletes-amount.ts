import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import dayjs from "dayjs";

import type { FastifyInstance } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function getAthletesLastWeekAmount(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).get("/metrics/last-week-athletes-amount", {
        schema: {
            tags: ["Metrics"],
            summary: "Get the amount of athletes created during the last week",
            security: [{ bearerAuth: [] }],
            response: {
                200: z.array(z.object({
                    date: z.string(),
                    count: z.number()
                }))
            }
        }
    }, async (request, reply) => {
        const today = dayjs();

        const lastWeek = today.subtract(6, "day");

        const athletes = await prisma.athlete.findMany({
            where: {
                createdAt: {
                    gte: lastWeek.toDate(),
                    lte: today.toDate(),
                },

                deletedAt: null
            },
        })

        const amount = Array.from({ length: 7 }).map((_, index) => {
            const date = lastWeek.add(index, "day").format("DD/MM/YYYY");

            const count = athletes.filter(
                (athlete) => dayjs(athlete.createdAt).format("DD/MM/YYYY") === date,
            ).length

            return { date, count }
        })

        return reply.send(amount);
    })
}