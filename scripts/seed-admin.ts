import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { admins } from "../src/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || "Admin";

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/seed-admin.ts <email> <password> [name]");
    process.exit(1);
  }

  const existing = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Admin with email ${email} already exists.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(admins).values({
    id: crypto.randomUUID(),
    email,
    passwordHash,
    name,
    createdAt: new Date(),
  });

  console.log(`Admin created: ${email}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
