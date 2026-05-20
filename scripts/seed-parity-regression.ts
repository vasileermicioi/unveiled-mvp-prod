import "dotenv/config";

import { postgresClient } from "@/db/client";
import { createParityDb, seedParityWorld } from "@/lib/testing/parity-seed";

async function run() {
  const database = createParityDb();
  const summary = await seedParityWorld(database);

  console.log("Parity regression fixtures ready.");
  console.log(
    `Admin:        ${summary.users.admin.email} / ${summary.password}`,
  );
  console.log(
    `Partner:      ${summary.users.partner.email} / ${summary.password}`,
  );
  console.log(
    `Active member:${summary.users.activeMember.email} / ${summary.password}`,
  );
  console.log(
    `Frozen member:${summary.users.frozenMember.email} / ${summary.password}`,
  );
  console.log(
    `Venue check-in: /venue-check-in/${summary.partnerId}?token=${summary.venueToken}`,
  );
}

void run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await postgresClient.end();
  });
