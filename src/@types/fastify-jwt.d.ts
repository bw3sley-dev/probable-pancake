import "@fastify/jwt"

declare module "@fastify/jwt" {
    export interface FastifyJWT {
        sub: string
        role: "ADMINISTRATOR" | "VOLUNTEER"
        area: (
            | "UNSPECIFIED"
            | "PSYCHOLOGY"
            | "PHYSIOTHERAPY"
            | "NUTRITION"
            | "NURSING"
            | "PSYCHOPEDAGOGY"
            | "PHYSICAL_EDUCATION"
        )[]
    }
}