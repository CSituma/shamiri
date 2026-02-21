import { config } from "dotenv";

config({ path: ".env.production" });

async function run() {
  const { seedPromise } = await import("./seed");
  await seedPromise;
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
