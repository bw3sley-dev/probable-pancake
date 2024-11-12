import { BadRequestError } from "@/errors/bad-request-error";

import { prisma } from "@/lib/prisma";

import { hash } from "bcryptjs";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function createAccount(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("/members", {
        schema: {
            tags: ["Auth"],
            summary: "Create a new account",
            body: z.object({
                name: z.string(),
                email: z.string().email(),
                phone: z.string(),
                password: z.string().min(6).default("T21-ARENA-PARK"),
                role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
                areas: z.array(z.enum([
                    "UNSPECIFIED",
                    "PSYCHOLOGY",
                    "PHYSIOTHERAPY",
                    "NUTRITION",
                    "NURSING",
                    "PSYCHOPEDAGOGY",
                    "PHYSICAL_EDUCATION",
                ])).default(["UNSPECIFIED"])
            }),
            response: {
                201: z.null()
            }
        }
    }, async (request, reply) => {
        const { name, email, phone, password, role, areas } = request.body;

        const userWithSameEmail = await prisma.member.findUnique({
            where: {
                email
            }
        });

        if (userWithSameEmail) {
            throw new BadRequestError("User with same e-mail already exists.");
        }

        const passwordHash = await hash(password, 6);

        await prisma.$transaction(async (context) => {
            const newMember = await context.member.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    phone,
                    role
                }
            });

            if (areas.length > 0) {
                const areasRecords = await context.area.findMany({
                    where: {
                        name: { in: areas }
                    }
                });

                const existingAreasNames = areasRecords.map(area => area.name);
                const areasToCreate = areas.filter(area => !existingAreasNames.includes(area));

                const createdAreas = await Promise.all(
                    areasToCreate.map(areaName =>
                        context.area.create({
                            data: { name: areaName }
                        })
                    )
                );

                const allAreas = [...areasRecords, ...createdAreas];
                
                await context.memberArea.createMany({
                    data: allAreas.map(area => ({
                        memberId: newMember.id,
                        areaId: area.id
                    }))
                });
            }
        });

        return reply.status(201).send();
    });
}
