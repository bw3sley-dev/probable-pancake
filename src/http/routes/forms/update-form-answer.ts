import { NotFoundError } from "@/errors/not-found-error";

import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function updateFormAnswer(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).put("/athletes/:athleteId/forms/:slug/answers", {
        schema: {
            tags: ["Forms"],
            summary: "Update answers for an athlete's form",
            security: [{ bearerAuth: [] }],
            params: z.object({
                athleteId: z.string().uuid(),
                slug: z.string(),
            }),
            body: z.object({
                questions: z.array(
                    z.object({
                        id: z.coerce.number(),
                        answer: z.union([z.string(), z.array(z.string())]),
                        observation: z.string().optional(),
                    })
                ),
            }),
            response: {
                204: z.null(),
            },
        },
    }, async (request, reply) => {
        const { athleteId, slug } = request.params;

        const { questions } = request.body;

        const athleteForm = await prisma.athleteForm.findFirst({
            where: {
                athleteId,
                form: { slug },
            },

            include: {
                answer: true,
                form: {
                    include: {
                        sections: {
                            include: {
                                questions: true,
                            },
                        },
                    },
                },
            },
        })

        if (!athleteForm) {
            throw new NotFoundError("Form not found for athlete");
        }

        await Promise.all(
            questions.map(async (question) => {
                await prisma.question.update({
                    where: { id: question.id },
                    data: {
                        observation: question.observation ?? null,
                    },
                });
            })
        )

        const data = questions.reduce((acc, question) => {
            acc[question.id] = question.answer;
            
            return acc;
        }, {} as Record<number, string | string[]>);

        const answer = athleteForm.answer;

        if (!answer) {
            await prisma.answer.create({
                data: {
                    data: data,
                    athleteFormId: athleteForm.id
                }
            })
        } 
        
        else {
            await prisma.answer.update({
                where: { id: answer.id },
                data: { data: data }
            })
        }

        return reply.status(204).send();
    })
}
