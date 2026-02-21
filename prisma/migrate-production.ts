import { config } from "dotenv";
import { execSync } from "child_process";

config({ path: ".env.production" });
execSync("npx prisma db push", { stdio: "inherit", env: process.env });
