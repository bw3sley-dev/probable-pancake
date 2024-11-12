import type { FastifyInstance } from "fastify";

import { ZodError } from "zod";

import { BadRequestError } from "./errors/bad-request-error";
import { UnauthorizedError } from "./errors/unauthorized-error";
import { NotFoundError } from "./errors/not-found-error";

import { env } from "./env";

type FastifyErrorHandler = FastifyInstance["errorHandler"]

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
    if (error instanceof ZodError) {
        reply.status(400).send({ message: "Validation error", errors: error.flatten().fieldErrors });
    }

    if (error instanceof BadRequestError) {
        reply.status(400).send({ message: error.message });
    }

    if (error instanceof UnauthorizedError) {
        reply.status(401).send({ message: error.message });
    }

    if (error instanceof NotFoundError) {
        reply.status(404).send({ message: error.message });
    }

    if (env.NODE_ENV === "dev") {
        console.error(error);
    }

    reply.status(500).send({ message: "Internal server error" })
}