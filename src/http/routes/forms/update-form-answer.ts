import { NotFoundError } from "@/errors/not-found-error";
import { auth } from "@/http/middlewares/auth";
import { prisma } from "@/lib/prisma";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export async function updateFormAnswer(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).put("/athletes/:athleteId/forms/:slug/answers", {
        schema: {
            tags: ["Forms"],
            summary: "Update answers for an athlete's form",
            security: [{ bearerAuth: [] }],
            params: z.object({
                athleteId: z.string().uuid(),
                slug: z.string(),
            }),
            body: z.object({
                questions: z.array(
                    z.object({
                        id: z.coerce.number(),
                        answer: z.union([z.string(), z.array(z.string())]),
                        observation: z.string().optional(),
                    })
                ),
            }),
            response: {
                204: z.null(),
            },
        },
    }, async (request, reply) => {
        const { athleteId, slug } = request.params;
        const { questions } = request.body;

        // Buscar o formulário do atleta
        const athleteForm = await prisma.athleteForm.findFirst({
            where: {
                athleteId,
                form: {
                    slug,
                },
            },
            include: {
                answer: true,
            },
        });

        if (!athleteForm) {
            throw new NotFoundError("Form not found for the specified athlete");
        }

        // Processar os dados para garantir compatibilidade com o formato esperado pela rota de listagem
        const existingAnswers = (athleteForm.answer?.data || {}) as Record<number, string | string[]>;

        questions.forEach((question) => {
            existingAnswers[question.id] = question.answer; // Atualiza ou insere a resposta
        });

        if (!athleteForm.answer) {
            // Criar nova entrada na tabela de respostas
            await prisma.answer.create({
                data: {
                    data: existingAnswers,
                    athleteFormId: athleteForm.id,
                },
            });
        } else {
            // Atualizar a entrada existente
            await prisma.answer.update({
                where: { id: athleteForm.answer.id },
                data: { data: existingAnswers },
            });
        }

        return reply.status(204).send();
    });
}
