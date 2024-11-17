import { NotFoundError } from "@/errors/not-found-error";

import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function getForm(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).get("/athletes/:athleteId/forms/:slug", {
        schema: {
            tags: ["Forms"],
            summary: "Get form details for an athlete by slug",
            security: [{ bearerAuth: [] }],
            params: z.object({
                athleteId: z.string().uuid(),
                slug: z.string()
            }),
            response: {
                200: z.object({
                    athlete: z.object({
                        id: z.string(),
                        name: z.string()
                    }),

                    form: z.object({
                        id: z.string(),

                        title: z.string(),
                        slug: z.string(),

                        sections: z.array(
                            z.object({
                                id: z.number(),

                                title: z.string(),
                                icon: z.string(),

                                questions: z.array(
                                    z.object({
                                        id: z.number(),

                                        title: z.string(),
                                        type: z.enum(["TEXTAREA", "INPUT", "CHECKBOX", "SELECT", "MULTI_SELECT", "DATE", "RADIO"]),

                                        description: z.string().nullable(),
                                        observation: z.string().nullable(),

                                        answer: z.union([z.string(), z.array(z.string())]).nullable(),

                                        options: z.array(
                                            z.object({
                                                label: z.string(),
                                                value: z.string()
                                            })
                                        ).optional()
                                    })
                                )
                            })
                        )
                    })
                })
            }
        }
    }, async (request, reply) => {
        const { athleteId, slug } = request.params;

        const athleteForm = await prisma.athleteForm.findFirst({
            where: { athleteId, form: { slug } },

            include: {
                form: {
                    include: {
                        sections: {
                            include: {
                                questions: {
                                    include: {
                                        options: true
                                    },

                                    orderBy: {
                                        id: "asc",
                                    }
                                }
                            },

                            orderBy: {
                                id: "asc",
                            }
                        }
                    }
                },

                answer: true,

                athlete: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!athleteForm) {
            throw new NotFoundError("Formulário não encontrado para o atleta");
        }

        const { form, athlete, answer } = athleteForm;

        const answerData = (answer?.data || {}) as Record<string, { answer: string | string[], observation?: string | null }>;

        const response = {
            athlete: {
                id: athlete.id,
                name: athlete.name,
            },

            form: {
                id: form.id,

                title: form.name,
                slug: form.slug,

                sections: form.sections.map((section) => ({
                    id: section.id,

                    title: section.title,
                    icon: section.icon,

                    questions: section.questions.map((question) => {
                        const answerEntry = answerData[question.id.toString()];

                        return {
                            id: question.id,

                            title: question.title,
                            type: question.type,

                            description: question.description ?? null,
                            observation: answerEntry?.observation ?? null,

                            answer: typeof answerEntry?.answer === "string" || Array.isArray(answerEntry?.answer)
                                ? answerEntry.answer
                                : "",

                            options: question.options.map((option) => ({
                                label: option.label,
                                value: option.value
                            }))
                        };
                    })
                }))
            },
        };

        return reply.send(response);
    });
}
