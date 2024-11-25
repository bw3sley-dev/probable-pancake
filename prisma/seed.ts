import { env } from "@/env";

import { PrismaClient } from "@prisma/client";

import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
    try {
        await prisma.member.deleteMany();

        const passwordHash = await hash("T21-ARENA-PARK", 6);

        const me = await prisma.member.create({
            data: {
                name: "Wesley Bernardes",
                email: env.POWER_USER,
                role: "ADMIN",
                passwordHash
            }
        })

        await prisma.area.createMany({
            data: [
                { name: "UNSPECIFIED" },
                { name: "PSYCHOLOGY" },
                { name: "PHYSIOTHERAPY" },
                { name: "NUTRITION" },
                { name: "NURSING" },
                { name: "PSYCHOPEDAGOGY" },
                { name: "PHYSICAL_EDUCATION" }
            ]
        })

        const areas = await prisma.area.findMany();

        await prisma.memberArea.createMany({
            data: areas.map((area) => ({
                memberId: me.id,
                areaId: area.id,
            })),
        });

        await prisma.form.create({
            data: {
                name: "Anamnese",
                slug: "anamnesis",

                sections: {
                    create: [
                        {
                            title: "Informações do atleta e estrutura familiar",
                            icon: "HeartHandshake",

                            questions: {
                                create: [
                                    {
                                        title: "Código Internacional de Doenças (CID)",
                                        type: "INPUT"
                                    },

                                    {
                                        title: "Local de nascimento",
                                        type: "INPUT"
                                    },

                                    {
                                        title: "Local de procedência",
                                        type: "INPUT"
                                    },

                                    {
                                        title: "Especificar histórico de locais e tempo de permanência",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Estado civil (Casado(a), Solteiro(a), Divorciado(a), Viúvo(a))",
                                        type: "SELECT",

                                        options: {
                                            create: [
                                                {
                                                    label: "Casado(a)",
                                                    value: "casado"
                                                },

                                                {
                                                    label: "Solteiro(a)",
                                                    value: "solteiro"
                                                },

                                                {
                                                    label: "Divorciado(a)",
                                                    value: "divorciado"
                                                },

                                                {
                                                    label: "Viúvo(a)",
                                                    value: "viuvo"
                                                }
                                            ]
                                        }
                                    },

                                    {
                                        title: "Especificar histórico de casamentos, separações ou viúvez",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Tem outros filhos? (quantos, nomes, onde residem?)",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Com quem o atleta reside: (especificar nome, idade, escolaridade, parentesco, profissão)",
                                        type: "TEXTAREA"
                                    },
                                ]
                            }
                        },

                        {
                            title: "Formação acadêmica e experiência profissional",
                            icon: "BookMarked",

                            questions: {
                                create: [
                                    {
                                        title: "O atleta frequentou a escola por quantos anos?",
                                        type: "INPUT"
                                    },

                                    {
                                        title: "Nível educacional? (1 grau completo (ensino fundamental), 2 grau completo (ensino médio), 3 grau completo)",
                                        type: "SELECT",

                                        options: {
                                            create: [
                                                {
                                                    label: "1 grau completo (ensino fundamental)",
                                                    value: "ensino-fundamental"
                                                },

                                                {
                                                    label: "2 grau completo (ensino médio)",
                                                    value: "ensino-medio"
                                                },

                                                {
                                                    label: "3 grau completo",
                                                    value: "completo"
                                                }
                                            ]
                                        }
                                    },

                                    {
                                        title: "Especificar histórico acadêmico do atleta (como foi sua performance acadêmica?)",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Especificar histórico de facilidades e dificuldades acadêmicas",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Especificar outras áreas de interesse do atleta (hobbies, lazer, objetos etc.)",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Descrever as atividades profissionais ou de ocupações anteriores do atleta",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Descreva as características do atleta no desempenho das atividades ocupacionais ou profissionais",
                                        type: "TEXTAREA"
                                    }
                                ]
                            }
                        },

                        {
                            title: "Aspectos funcionais",
                            icon: "BicepsFlexed",

                            questions: {
                                create: [
                                    {
                                        title: "Cuidados pessoais (alimentação, higiene, vestir-se)",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Locomoção (andar sozinho, sair de casa, andar de bicicleta/triciclo/patinete)",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Organização da casa e pertences",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Administração de dinheiro",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Tratamento médico (controle de medicações, dietas, compreensão e registro de orientações)",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Condução das atividades de trabalho e ocupacionais",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Problemas conjugais ou familiares",
                                        type: "TEXTAREA"
                                    },
                                ]
                            }
                        },

                        {
                            title: "Rotina e atividades atuais",
                            icon: "ListTodo",

                            questions: {
                                create: [
                                    {
                                        title: "Descreva como é a rotina atual do atleta (descrever um dia típico do começo ao fim, com as atividades de rotina em casa, outras atividades, retorno a casa, atividades realizadas em casa, período de sono, aulas ou curso realizados, etc)",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Descreva como está a vida do atleta no presente momento",
                                        type: "TEXTAREA"
                                    }
                                ]
                            }
                        },

                        {
                            title: "Saúde mental e comportamento",
                            icon: "Brain",

                            questions: {
                                create: [
                                    {
                                        title: "Descreva o padrão de humor do atleta",
                                        type: "MULTI_SELECT",

                                        options: {
                                            create: [
                                                {
                                                    label: "Ansioso",
                                                    value: "ansioso"
                                                },

                                                {
                                                    label: "Depressivo",
                                                    value: "depressivo"
                                                },

                                                {
                                                    label: "Irritável",
                                                    value: "irritavel"
                                                },

                                                {
                                                    label: "Raivosos",
                                                    value: "raivosos"
                                                },

                                                {
                                                    label: "Estável",
                                                    value: "estavel"
                                                },

                                                {
                                                    label: "Instável",
                                                    value: "instavel"
                                                }
                                            ]
                                        }
                                    },

                                    {
                                        title: "Ocorreram mudanças neste padrão?",
                                        type: "RADIO",

                                        options: {
                                            create: [
                                                {
                                                    label: "Sim",
                                                    value: "yes"
                                                },

                                                {
                                                    label: "Não",
                                                    value: "no"
                                                },

                                            ]
                                        }
                                    },

                                    {
                                        title: "Desde quando?",
                                        type: "DATE"
                                    },

                                    {
                                        title: "Descreva o sono do atleta",
                                        type: "RADIO",

                                        options: {
                                            create: [
                                                {
                                                    label: "Está normal",
                                                    value: "is-normal"
                                                },

                                                {
                                                    label: "Está alterado",
                                                    value: "is-changed"
                                                },

                                            ]
                                        }
                                    },

                                    {
                                        title: "Ocorreram mudanças neste padrão?",
                                        type: "TEXTAREA"
                                    }
                                ]
                            }
                        },

                        {
                            title: "Saúde física e funcionalidades",
                            icon: "HeartPulse",

                            questions: {
                                create: [
                                    {
                                        title: "Dificuldades para andar, usar as mãos, escrever, vestir-se sozinho, manter o equilíbrio?",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Perda da audição ou visão?",
                                        type: "RADIO",

                                        options: {
                                            create: [
                                                {
                                                    label: "Sim",
                                                    value: "yes"
                                                },

                                                {
                                                    label: "Não",
                                                    value: "no"
                                                },

                                            ]
                                        }
                                    },

                                    {
                                        title: "Uso de aparelho auditivo ou óculos?",
                                        type: "RADIO",

                                        options: {
                                            create: [
                                                {
                                                    label: "Sim",
                                                    value: "yes"
                                                },

                                                {
                                                    label: "Não",
                                                    value: "no"
                                                },

                                            ]
                                        }
                                    },

                                    {
                                        title: "Histórico de doenças e condições (doença cardíaca, trauma de crânio, doença vascular, etc..)?",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Histórico médico anterior?",
                                        type: "RADIO",

                                        options: {
                                            create: [
                                                {
                                                    label: "Sim",
                                                    value: "yes"
                                                },

                                                {
                                                    label: "Não",
                                                    value: "no"
                                                },

                                            ]
                                        }
                                    },

                                    {
                                        title: "Perda de consciência (quando e motivo)?",
                                        type: "RADIO",

                                        options: {
                                            create: [
                                                {
                                                    label: "Sim",
                                                    value: "yes"
                                                },

                                                {
                                                    label: "Não",
                                                    value: "no"
                                                },

                                            ]
                                        }
                                    },

                                    {
                                        title: "Histórico de cirurgias?",
                                        type: "RADIO",

                                        options: {
                                            create: [
                                                {
                                                    label: "Sim",
                                                    value: "yes"
                                                },

                                                {
                                                    label: "Não",
                                                    value: "no"
                                                },

                                            ]
                                        }
                                    },

                                    {
                                        title: "Histórico familiar de doenças (doença cardíaca, hipertensão, doença psiquiátrica, etc..)",
                                        type: "TEXTAREA"
                                    }
                                ]
                            }
                        },

                        {
                            title: "Medicamentos e exames",
                            icon: "Stethoscope",

                            questions: {
                                create: [
                                    {
                                        title: "Quais medicamentos, dosagens e motivos, que estão sendo usados pelo atleta neste momento?",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Liste o nome e especialidade dos médicos que fazem o acompanhamento clinico do atleta no momento",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "O atleta já realizou algum dos exames abaixo?",
                                        type: "MULTI_SELECT",

                                        options: {
                                            create: [
                                                {
                                                    label: "TC (Tomografia Computadorizada de Crânio)",
                                                    value: "tcc",
                                                },

                                                {
                                                    label: "Angiografia",
                                                    value: "angiografia",
                                                },

                                                {
                                                    label: "EEG (Eletroencefalograma)",
                                                    value: "egg",
                                                },

                                                {
                                                    label: "Mapa",
                                                    value: "mapa",
                                                },

                                                {
                                                    label: "RM (Ressonância Magnética de Crânio)",
                                                    value: "rmc",
                                                },

                                                {
                                                    label: "Cintilografia de Perfusão Cerebral (Spect)",
                                                    value: "cpcs",
                                                },

                                                {
                                                    label: "Exame do Líquido Céfalorraquidiano (Líqüor)",
                                                    value: "elcl",
                                                },

                                                {
                                                    label: "Audiometria",
                                                    value: "audiometria",
                                                },

                                                {
                                                    label: "Holter",
                                                    value: "holter",
                                                },
                                            ],
                                        }
                                    },

                                    {
                                        title: "Irá realizar algum outro exame? Qual?",
                                        type: "TEXTAREA"
                                    }
                                ]
                            }
                        },

                        {
                            title: "Alergias e eliminações fisiológicas",
                            icon: "PillBottle",

                            questions: {
                                create: [
                                    {
                                        title: "Alergias alimentares, medicamentosas, de contato",
                                        type: "TEXTAREA"
                                    },

                                    {
                                        title: "Capacidade de ir ao banheiro sozinho",
                                        type: "RADIO",

                                        options: {
                                            create: [
                                                {
                                                    label: "Sim",
                                                    value: "yes",
                                                },

                                                {
                                                    label: "Não",
                                                    value: "no",
                                                },
                                            ],
                                        }
                                    },

                                    {
                                        title: "Incontinência urinária e fecal",
                                        type: "RADIO",

                                        options: {
                                            create: [
                                                {
                                                    label: "Sim",
                                                    value: "yes",
                                                },

                                                {
                                                    label: "Não",
                                                    value: "no",
                                                },
                                            ],
                                        }
                                    },

                                    {
                                        title: "Uso de fraldas",
                                        type: "RADIO",

                                        options: {
                                            create: [
                                                {
                                                    label: "Sim",
                                                    value: "yes",
                                                },

                                                {
                                                    label: "Não",
                                                    value: "no",
                                                },
                                            ],
                                        }
                                    },

                                    {
                                        title: "Rotina de necessidades fisiológicas",
                                        type: "TEXTAREA"
                                    }
                                ]
                            }
                        },

                        {
                            title: "Alimentação familiar",
                            icon: "Utensils",

                            questions: {
                                create: [
                                    {
                                        title: "Quantas pessoas se alimentam na casa?",
                                        type: "INPUT",
                                    },

                                    {
                                        title: "Quem é o responsável pela compra de alimentos?",
                                        type: "INPUT",
                                    },

                                    {
                                        title: "A compra é feita (diariamente, semanalmente, quinzenalmente)",
                                        type: "SELECT",

                                        options: {
                                            create: [
                                                {
                                                    label: "Diariamente",
                                                    value: "diariamente"
                                                },

                                                {
                                                    label: "Semanalmente",
                                                    value: "semanalmente"
                                                },

                                                {
                                                    label: "Quinzenalmente",
                                                    value: "quinzenalmente"
                                                }
                                            ]
                                        }
                                    },

                                    {
                                        title: "Onde os alimentos são comprados (supermercado, feira)?",
                                        type: "SELECT",

                                        options: {
                                            create: [
                                                {
                                                    label: "Supermercado",
                                                    value: "supermercado"
                                                },

                                                {
                                                    label: "Feira",
                                                    value: "feira"
                                                }
                                            ]
                                        }
                                    },

                                    {
                                        title: "Quem prepara as refeições?",
                                        type: "TEXTAREA",
                                    },

                                    {
                                        title: "Onde as refeições são realizadas?",
                                        type: "TEXTAREA",
                                    },

                                    {
                                        title: "Quantas refeições são realizadas pela família",
                                        type: "INPUT",
                                    },

                                    {
                                        title: "Quem participa das refeições?",
                                        type: "TEXTAREA",
                                    },

                                    {
                                        title: "Alguém da família possui alergia alimentar? Se sim, quem e a que?",
                                        type: "TEXTAREA",
                                    },

                                    {
                                        title: "Alguém da família possui intolerância alimentar? Se sim, quem e a que?",
                                        type: "TEXTAREA",
                                    },

                                    {
                                        title: "Alguém da família segue alguma dieta especial? Se sim, quem e por quê?",
                                        type: "TEXTAREA",
                                    },

                                    {
                                        title: "Quais são os alimentos preferidos da família?",
                                        type: "TEXTAREA",
                                    },

                                    {
                                        title: "Alguém da família faz uso de algum suplemento alimentar? Se sim, quem e qual? Quem indicou?",
                                        type: "TEXTAREA",
                                    },

                                    {
                                        title: "Qual a quantidade de sal usada em 1 mês pela família?",
                                        type: "INPUT",
                                    },

                                    {
                                        title: "Qual a quantidade de óleo usada em 1 mês pela família?",
                                        type: "INPUT",
                                    },

                                    {
                                        title: "Produtos diet e light são consumidos pela família?",
                                        type: "RADIO",

                                        options: {
                                            create: [
                                                {
                                                    label: "Sim",
                                                    value: "yes"
                                                },

                                                {
                                                    label: "Não",
                                                    value: "no"
                                                }
                                            ]
                                        }
                                    },
                                ]
                            }
                        }
                    ]
                }
            }
        })

        console.log("✅ Database seeded!");
    }

    catch (error) {
        console.log("❌ Failed to seed database!", error);
    }

    finally {
        await prisma.$disconnect();
    }
}

seed();