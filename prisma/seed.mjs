import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const passwordHash = await bcrypt.hash("hxp-demo-2026", 12);
await prisma.user.upsert({
  where: { email: "demo@thehumanxp.com" },
  update: {},
  create: {
    email: "demo@thehumanxp.com",
    passwordHash,
    name: "HXP Demo Listener",
    handle: "demo-listener",
    bio: "A clearly labeled local-development profile for exploring the HXP community.",
    interests: JSON.stringify(["Consciousness", "Psychology", "Human Potential"]),
    membership: "paid",
    role: "admin",
  },
});
await prisma.$disconnect();
console.log("Seeded local demo account: demo@thehumanxp.com / hxp-demo-2026");
