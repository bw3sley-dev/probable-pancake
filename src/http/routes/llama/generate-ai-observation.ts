import { NotFoundError } from "@/errors/not-found-error";

import { auth } from "@/http/middlewares/auth";

import { client } from "@/lib/openai";

import { prisma } from "@/lib/prisma";

import type { FastifyInstance } from "fastify";

import type { ZodTypeProvider } from "fastify-type-provider-zod";

import z from "zod";

export async function generateAIObservation(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).post("/athletes/:athleteId/anamnesis/ai-observation", {
        schema: {
            tags: ["Llama"],
            summary: "Generate an AI-based observation for an athlete's anamnesis",
            params: z.object({
                athleteId: z.string().uuid()
            }),
            response: {
                201: z.object({
                    observation: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const { athleteId } = request.params;

        const athleteForm = await prisma.athleteForm.findFirst({
            where: {
                athleteId,

                form: { slug: "anamnesis" }
            },

            include: {
                answer: true
            }
        })

        if (!athleteForm || !athleteForm.answer) {
            throw new NotFoundError("Anamnesis data not found for the athlete");
        }

        const anamnesis = athleteForm.answer.data;

        const prompt = `
            Você é uma Inteligência Artificial integrada à plataforma T21 Arena Park, um sistema voltado para acompanhamento e desenvolvimento de atletas com síndrome de down. A plataforma permite que profissionais de saúde e técnicos registrem avaliações detalhadas dos atletas, com foco em suas capacidades físicas, emocionais, sociais e cognitivas. Uma parte importante do acompanhamento é o formulário de anamnese, que coleta informações abrangentes sobre o histórico do atleta, sua vida diária, saúde física e mental, entre outros aspectos.

            Sua tarefa é analisar as respostas fornecidas no formulário de anamnese do atleta e gerar uma observação detalhada. Essa observação deve ser útil para os profissionais que acompanham o atleta, fornecendo insights baseados nas respostas. A observação deve considerar o contexto individual do atleta e fornecer sugestões ou destacar pontos que mereçam atenção. Seja específico em suas análises, mantendo um tom informativo e objetivo.

            Dados da anamnese:
            ${JSON.stringify(anamnesis)}

            Gere uma observação de 3 a 5 linhas com base nesses dados.
        `

        const completion = await client.chat.completions.create({
            model: "gpt-4o",
            stream: false,
            messages: [
                { 
                    "role": "system", 
                    "content": "You are an AI specialized in analyzing anamnesis forms for athletes in the T21 Arena Park project, a futsal inclusion program for individuals with Down syndrome. Based solely on the information provided in the form, synthesize the key points into a concise, clear observation about the athlete. Limit your response to a maximum of 5 lines, focusing on aspects of the athlete’s well-being, performance, and potential support needs. The response should be in Brazilian Portuguese and use only the data present in the anamnesis, with a professional and objective tone." 
                },
                
                { 
                    "role": "user", 
                    "content": prompt 
                }
            ]
        });

        const observation = completion.choices[0].message.content?.trim();

        if (!observation) {
            throw new Error("Failed to generate AI observation");
        }

        await prisma.athleteForm.update({
            where: { id: athleteForm.id },

            data: { IAObservation: observation }
        })

        return reply.status(201).send({ observation });
    })
}