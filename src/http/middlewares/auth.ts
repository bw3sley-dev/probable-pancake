import { FastifyInstance } from "fastify";

import { UnauthorizedError } from "@/errors/unauthorized-error";

import fastifyPlugin from "fastify-plugin";

interface Token {
    sub: string,
    role: "ADMIN" | "MEMBER",
    area:
    | 'UNSPECIFIED'
    | 'PSYCHOLOGY'
    | 'PHYSIOTHERAPY'
    | 'NUTRITION'
    | 'NURSING'
    | 'PSYCHOPEDAGOGY'
    | 'PHYSICAL_EDUCATION'
}

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
    app.addHook("preHandler", async (request) => {
        request.getCurrentUserId = async () => {
            try {
                const { sub } = await request.jwtVerify<Token>();

                return sub;
            }

            catch {
                throw new UnauthorizedError("Invalid token");
            }
        }
    })
})