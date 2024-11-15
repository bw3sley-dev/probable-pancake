import { env } from "@/env";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

import nodemailer from "nodemailer";

import { createMailHTML } from "@/utils/create-mail-html";

export async function requestPasswordRecover(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("/password/recover", {
        schema: {
            tags: ["Auth"],
            summary: "Get authenticated user profile",
            body: z.object({
                email: z.string().email()
            }),
            response: {
                201: z.null()
            }
        }
    }, async (request, reply) => {
        const { email } = request.body;

        const userFromEmail = await prisma.member.findUnique({
            where: { email, deleteAt: null }
        })

        if (!userFromEmail) {
            return reply.status(201).send();
        }

        const { id: code } = await prisma.token.create({
            data: {
                type: "PASSWORD_RECOVER",
                memberId: userFromEmail.id
            }
        })

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASSWORD
            }
        })

        const mail = {
            from: `Plataforma | T21 Arena Park <${env.SMTP_USER}>`,
            to: email,
            subject: "Hora de recuperar sua senha",
            html: createMailHTML({ code })
        }

        try {
            await transporter.sendMail(mail);

            // console.log("Password recover token: ", code);
        }

        catch (error) {
            console.log(error);

            throw new Error("Failed to send password recorey e-mail");
        }

        return reply.status(201).send();
    })
}