import { faker } from "@faker-js/faker";

import { PrismaClient } from "@prisma/client";

import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
    try {
        await prisma.member.deleteMany();
    
        const passwordHash = await hash("T21-ARENA-PARK", 6);
    
        await prisma.member.createMany({
            data: [
                {
                    name: "Wesley Bernardes",
                    email: "bw3sley@t21arenapark.com",
                    role: "ADMIN",
                    phone: faker.phone.number(),
                    avatarUrl: "https://github.com/bw3sley.png",
                    passwordHash,
                    createdAt: faker.date.past()
                },
                
                {
                    name: faker.person.fullName(),
                    email: faker.internet.email(),
                    role: "MEMBER",
                    phone: faker.phone.number(),
                    avatarUrl: faker.image.avatarGitHub(),
                    passwordHash,
                    createdAt: faker.date.past()
                }
            ]
        });

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