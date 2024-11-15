import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import { Specialties } from "@prisma/client";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function createAthlete(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).post("/athletes", {
        schema: {
            tags: ["Athletes"],
            summary: "Create a new athlete",
            security: [{ bearerAuth: [] }],
            body: z.object({
                name: z.string(),
                gender: z.enum(["MALE", "FEMALE"]),
                handedness: z.enum(["RIGHT", "LEFT"]),
                bloodType: z.enum([
                    "A_POSITIVE",
                    "A_NEGATIVE",
                    "B_POSITIVE",
                    "B_NEGATIVE",
                    "AB_POSITIVE",
                    "AB_NEGATIVE",
                    "O_POSITIVE",
                    "O_NEGATIVE"
                ]),
                birthDate: z.preprocess((arg) => {
                    if (typeof arg === "string") {
                        return new Date(arg);
                    }
                    
                    return arg;
                }, z.date())
            }),
            response: {
                201: z.null()
            }
        }
    }, async (request, reply) => {
        const { name, gender, handedness, bloodType, birthDate } = request.body;

        const userId = await request.getCurrentUserId();

        const newAthlete = await prisma.$transaction(async (prisma) => {
            const athlete = await prisma.athlete.create({
                data: {
                    name,
                    gender,
                    handedness,
                    bloodType,
                    birthDate: new Date(birthDate),
    
                    address: {
                        create: {}
                    },
    
                    guardian: {
                        create: {}
                    },
    
                    member: {
                        connect: { id: userId }
                    }
                }
            })
    
            const anamnesis = await prisma.form.findUnique({
                where: { slug: "anamnesis" }
            })

            if (anamnesis) {
                await prisma.athleteForm.create({
                    data: {
                        athleteId: athlete.id,
                        formId: anamnesis.id
                    }
                })
            }

            return athlete;
        })

        const areaNames = [
            "UNSPECIFIED",
            "PSYCHOLOGY",
            "PHYSIOTHERAPY",
            "NUTRITION",
            "NURSING",
            "PSYCHOPEDAGOGY",
            "PHYSICAL_EDUCATION"
        ]

        for (const areaName of areaNames) {
            const area = await prisma.area.upsert({
                where: { name: areaName as Specialties },
                create: { name: areaName as Specialties },
                update: {}
            })

            await prisma.thread.create({
                data: {
                    athleteId: newAthlete.id,
                    areaId: area.id,
                }
            })
        }

        return reply.status(201).send();
    })
}