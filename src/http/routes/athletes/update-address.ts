import { NotFoundError } from "@/errors/not-found-error";

import { auth } from "@/http/middlewares/auth";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function updateAthleteAddress(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).put("/athletes/:athleteId/address", {
        schema: {
            tags: ["Athletes"],
            summary: "Update an athlete address information",
            security: [{ bearerAuth: [] }],
            params: z.object({
                athleteId: z.string().uuid()
            }),
            body: z.object({
                street: z.string().nullable(),
                neighborhood: z.string().nullable(), 
                postalCode: z.string().nullable(),
                complement: z.string().nullable(),
                number: z.string().nullable(),
                city: z.string().nullable(),
                uf: z.string().nullable(),
                country: z.string().nullable()
            }),
            response: {
                204: z.null()
            }
        }
    }, async (request, reply) => {
        const { athleteId } = request.params;

        const athlete = await prisma.athlete.findUnique({
            where: { id: athleteId }
        }) 

        if (!athlete) {
            throw new NotFoundError("Athlete not found");
        }

        const { street, neighborhood, postalCode, complement, number, city, uf, country } = request.body;

        await prisma.address.update({
            where: {
                id: athlete.addressId
            },

            data: {
                street,
                neighborhood,
                postalCode,
                complement,
                number,
                city,
                uf,
                country
            }
        })

        return reply.status(204).send();
    })
}