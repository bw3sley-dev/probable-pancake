import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["dev", "test", "production"]).default("production"),
    JWT_SECRET: z.string(),
    OPENAI_API_KEY: z.string(),
    SMTP_USER: z.string(),
    SMTP_PASSWORD: z.string(),
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().default(3333)
})

export const env = envSchema.parse(process.env);