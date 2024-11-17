import { NotFoundError } from "@/errors/not-found-error";

import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import dayjs from "dayjs";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function getAthlete(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).get("/athletes/:athleteId", {
        schema: {
            tags: ["Athletes"],
            summary: "Get an athlete by ID",
            security: [{ bearerAuth: [] }],
            params: z.object({
                athleteId: z.string().uuid()
            }),
            response: {
                200: z.object({
                    athlete: z.object({
                        id: z.string(),
                        name: z.string(),
                        gender: z.string(),
                        handedness: z.string(),
                        bloodType: z.string(),
                        birthDate: z.string(),
                        observation: z.string().nullable()
                    }),

                    address: z.object({
                        street: z.string().nullable(),
                        neighborhood: z.string().nullable(),
                        postalCode: z.string().nullable(),
                        complement: z.string().nullable(),
                        number: z.string().nullable(),
                        city: z.string().nullable(),
                        uf: z.string().nullable(),
                        country: z.string().nullable()
                    }).nullable(),
                    
                    guardian: z.object({
                        name: z.string().nullable(),
                        email: z.string().nullable(),
                        cpf: z.string().nullable(),
                        rg: z.string().nullable(),
                        relationshipDegree: z.string().nullable(),
                        gender: z.string().nullable()
                    }).nullable(),

                    anamnesis: z.object({
                        id: z.string(),
                        progress: z.number(),
                        slug: z.string()
                    }).nullable()
                })
            }
        }
    }, async (request, reply) => {
        const { athleteId } = request.params;

        const athlete = await prisma.athlete.findUnique({
            where: { id: athleteId },

            include: {
                address: true,
                guardian: true,

                forms: {
                    where: {
                        form: {
                            slug: "anamnesis"
                        }
                    },

                    include: {
                        form: {
                            include: {
                                sections: {
                                    include: {
                                        questions: true
                                    }
                                }
                            }
                        },

                        answer: true
                    }
                }
            }
        })

        if (!athlete) {
            throw new NotFoundError("Athlete not found");
        }

        const anamnesis = athlete.forms[0];
        
        let completionPercentage = 0;

        if (anamnesis) {
            const totalQuestions = anamnesis.form.sections.reduce((sum, section) => sum + section.questions.length, 0);

            const answeredQuestions = anamnesis.answer?.data ? Object.keys(anamnesis.answer.data).length : 0;

            if (totalQuestions > 0) {
                completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
            }
        }

        return reply.send({
            athlete: {
                id: athlete.id,
                name: athlete.name,
                
                gender: athlete.gender,
                bloodType: athlete.bloodType,
                handedness: athlete.handedness,
    
                birthDate: dayjs(athlete.birthDate).format("DD/MM/YYYY"),

                observation: completionPercentage > 80 ? anamnesis.IAObservation : null 
            },

            address: athlete.address ? {
                street: athlete.address.street,
                neighborhood: athlete.address.neighborhood,
                postalCode: athlete.address.postalCode,
                complement: athlete.address.complement,
                number: athlete.address.number,
                city: athlete.address.city,
                uf: athlete.address.uf,
                country: athlete.address.country
            } : null,
            
            guardian: athlete.guardian ? {
                name: athlete.guardian.name,
                email: athlete.guardian.email,
                cpf: athlete.guardian.cpf,
                rg: athlete.guardian.rg,
                relationshipDegree: athlete.guardian.relationshipDegree,
                gender: athlete.guardian.gender ? athlete.guardian.gender : null
            } : null,

            anamnesis: anamnesis ? {
                id: anamnesis.form.id,
                progress: completionPercentage,
                slug: "anamnesis"
            } : null
        })
    })
}