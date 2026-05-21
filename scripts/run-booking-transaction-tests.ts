import "dotenv/config";

let rawDatabaseUrl =
  process.env.BOOKING_TRANSACTION_TEST_DATABASE_URL ||
  process.env.PARITY_TEST_DATABASE_URL;

if (!rawDatabaseUrl) {
  console.error("Error: Booking transaction database is not configured.");
  console.error(
    "Please configure BOOKING_TRANSACTION_TEST_DATABASE_URL or PARITY_TEST_DATABASE_URL.",
  );
  process.exit(1);
}

// Automatically resolve pooled Neon URL to direct unpooled URL to avoid transaction hangs
if (rawDatabaseUrl.includes("-pooler")) {
  try {
    const parsed = new URL(rawDatabaseUrl);
    if (
      parsed.hostname.endsWith(".neon.tech") &&
      parsed.hostname.includes("-pooler")
    ) {
      parsed.hostname = parsed.hostname.replace("-pooler", "");
      rawDatabaseUrl = parsed.toString();
    }
  } catch {
    rawDatabaseUrl = rawDatabaseUrl.replace("-pooler", "");
  }
}

const databaseUrl = rawDatabaseUrl;

let maskedUrl = "unknown";
try {
  const parsed = new URL(databaseUrl);
  parsed.password = "****";
  maskedUrl = parsed.toString();
} catch {
  // Fallback simple replacement if URL parsing fails
  maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ":****@");
}

console.log(
  `[transactions] Running booking transaction tests against ${maskedUrl}`,
);

const child = Bun.spawn(
  ["bun", "test", "src/lib/booking-transactions.integration.test.ts"],
  {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      BOOKING_TRANSACTION_TEST_DATABASE_URL: databaseUrl,
    },
    stderr: "inherit",
    stdout: "inherit",
  },
);

const exitCode = await child.exited;
process.exit(exitCode);
