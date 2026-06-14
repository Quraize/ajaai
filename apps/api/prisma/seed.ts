import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const users = [
  { email: "alice@example.com", name: "Alice", password: "password123" },
  { email: "bob@example.com", name: "Bob", password: "password123" },
  { email: "carol@example.com", name: "Carol", password: "password123" },
];

async function main() {
  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (existing) continue;

    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: await bcrypt.hash(user.password, 10),
      },
    });
  }
  console.log("Seeded demo users:");
  for (const u of users) {
    console.log(`  ${u.email} / ${u.password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
