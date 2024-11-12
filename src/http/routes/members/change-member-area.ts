import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

import { prisma } from "@/lib/prisma";

import { auth } from "@/http/middlewares/auth";

import { NotFoundError } from "@/errors/not-found-error";

export async function changeMemberArea(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).patch("/members/:memberId/change-area", {
        schema: {
            tags: ["Members"],
            summary: "Change the areas of a member",
            params: z.object({
                memberId: z.string().uuid()
            }),
            body: z.object({
                areas: z.array(z.enum([
                    "UNSPECIFIED",
                    "PSYCHOLOGY",
                    "PHYSIOTHERAPY",
                    "NUTRITION",
                    "NURSING",
                    "PSYCHOPEDAGOGY",
                    "PHYSICAL_EDUCATION"
                ])).min(1)
            }),
            response: {
                204: z.null(),
            }
        }
    }, async (request, reply) => {
        const { memberId } = request.params;

        const { areas } = request.body;

        const member = await prisma.member.findUnique({
            where: { id: memberId },
        })

        if (!member) {
            throw new NotFoundError("Member not found");
        }

        const existingAreas = await prisma.memberArea.findMany({
            where: { memberId },
            select: { areaId: true }
        })

        const existingAreaIds = new Set(existingAreas.map(area => area.areaId));

        const allAreas = await prisma.area.findMany({
            where: {
                name: { in: areas }
            }
        })

        const newAreaIds = new Set(allAreas.map(area => area.id));

        const areasToAdd = [...newAreaIds].filter(areaId => !existingAreaIds.has(areaId));
        const areasToRemove = [...existingAreaIds].filter(areaId => !newAreaIds.has(areaId));

        await prisma.$transaction(async (prisma) => {
            if (areasToRemove.length > 0) {
                await prisma.memberArea.deleteMany({
                    where: {
                        memberId,
                        areaId: { in: areasToRemove }
                    }
                })
            }

            for (const areaId of areasToAdd) {
                await prisma.memberArea.create({
                    data: {
                        memberId,
                        areaId
                    }
                })
            }
        })

        return reply.status(204).send();
    })
}
