import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function updateMember(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).put("/members/:memberId", {
        schema: {
            tags: ["Members"],
            summary: "Update a member",
            security: [{ bearerAuth: [] }],
            params: z.object({
                memberId: z.string().uuid()
            }),
            body: z.object({
                name: z.string(),
                email: z.string().email(),
                phone: z.string().nullable(),
                role: z.enum(["ADMIN", "MEMBER"]),
                areas: z.array(z.enum([
                    "UNSPECIFIED",
                    "PSYCHOLOGY",
                    "PHYSIOTHERAPY",
                    "NUTRITION",
                    "NURSING",
                    "PSYCHOPEDAGOGY",
                    "PHYSICAL_EDUCATION",
                ]))
            }),
            response: {
                204: z.null(),
            },
        }
    }, async (request, reply) => {
        const { memberId } = request.params;

        const { name, email, phone, role, areas } = request.body;

        await prisma.$transaction(async (prisma) => {
            await prisma.member.update({
                where: { id: memberId },
                data: { name, email, phone, role }
            })

            const existingAreas = await prisma.memberArea.findMany({
                where: { memberId },
                select: { areaId: true }
            })

            const existingAreaIds = existingAreas.map(item => item.areaId);

            const areaRecords = await prisma.area.findMany({
                where: { name: { in: areas } },
                select: { id: true, name: true }
            })

            const areaMap = new Map(areaRecords.map(area => [area.name, area.id]));

            const newAreaIds = areas.map(area => areaMap.get(area)).filter(id => id !== undefined) as number[];

            const areasToAdd = newAreaIds.filter(id => !existingAreaIds.includes(id));
            const areasToRemove = existingAreaIds.filter(id => !newAreaIds.includes(id));

            if (areasToAdd.length > 0) {
                await prisma.memberArea.createMany({
                    data: areasToAdd.map(areaId => ({
                        memberId,
                        areaId
                    })),

                    skipDuplicates: true
                })
            }

            if (areasToRemove.length > 0) {
                await prisma.memberArea.deleteMany({
                    where: {
                        memberId,
                        areaId: { in: areasToRemove }
                    }
                })
            }
        })

        return reply.status(204).send();
    })
}
