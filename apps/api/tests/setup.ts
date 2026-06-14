import { execSync } from "child_process";
import path from "path";

process.env.DATABASE_URL = "file:./test.db";
process.env.JWT_SECRET = "test-secret";

const schemaPath = path.resolve(__dirname, "../prisma/schema.prisma");

execSync(`npx prisma migrate deploy --schema=${schemaPath}`, { stdio: "ignore" });
execSync(`npx prisma db seed --schema=${schemaPath}`, { stdio: "ignore" });
