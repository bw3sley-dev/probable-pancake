import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function getAnamnesisAmount(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).get("/metrics/anamnesis-amount", {
        schema: {
            tags: ["Metrics"],
            summary: "Get the amount of completed anamneses",
            security: [{ bearerAuth: [] }],
            response: {
                200: z.object({
                    amount: z.number()
                })
            }
        }
    }, async (request, reply) => {
        const amount = await prisma.athleteForm.count({
            where: {
                form: {
                    slug: "anamnesis"
                },

                athlete: {
                    deletedAt: null
                },

                answer: {
                    isNot: null
                }
            }
        });

        return reply.send({ amount: amount ?? 0 });
    });
}
