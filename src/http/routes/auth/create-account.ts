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
            where: { email, deleteAt: null }
        })

        if (userWithSameEmail) {
            throw new BadRequestError("Usuário com mesmo e-mail");
        }

        const passwordHash = await hash(password, 6);

        const areasRecords = await prisma.area.findMany({
            where: { name: { in: areas } }
        })

        await prisma.$transaction(async (prisma) => {
            const newMember = await prisma.member.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    phone,
                    role
                }
            })

            if (areasRecords.length > 0) {
                await prisma.memberArea.createMany({
                    data: areasRecords.map(area => ({
                        memberId: newMember.id,
                        areaId: area.id
                    }))
                })
            }
        })

        return reply.status(201).send();
    })
}
