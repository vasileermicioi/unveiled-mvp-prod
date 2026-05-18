import {
  createParityDb,
  seedParityWorld,
} from "../../src/lib/testing/parity-seed";

export default async function globalSetup() {
  if (!process.env.PARITY_TEST_DATABASE_URL && !process.env.DATABASE_URL) {
    throw new Error(
      "PARITY_TEST_DATABASE_URL or DATABASE_URL is required for Playwright parity tests.",
    );
  }

  await seedParityWorld(createParityDb());
}
