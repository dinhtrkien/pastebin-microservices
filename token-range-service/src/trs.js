import express from "express";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
// It will automatically read the DATABASE_URL from the environment variables
const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Simple health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.post("/leaseRange", async (req, res) => {
  const { instanceId, batchSize = 100 } = req.body; // Default batch size as per instructions

  if (!instanceId) {
    return res.status(400).json({ error: "instanceId is required" });
  }

  console.log(
    `Lease request received from ${instanceId} for batch size ${batchSize}`
  );

  try {
    // Use a transaction with Serializable isolation level for consistency
    const slice = await prisma.$transaction(
      async (tx) => {
        // 1. Try to grab an unused portion of an existing slice where the lease expired or it was never allocated
        // Use FOR UPDATE SKIP LOCKED to prevent multiple instances from grabbing the same row concurrently
        const now = new Date();
        // Find rows that are unallocated, AND still have numbers left (next_value <= range_end)
        const availableRows = await tx.$queryRaw`
        SELECT * FROM token_ranges
        WHERE leased_by = 'UNALLOCATED' AND next_value <= range_end
        ORDER BY range_start ASC -- Prefer older ranges first
        LIMIT 1
        FOR UPDATE SKIP LOCKED`;

        let row = availableRows[0];

        if (row) {
          // Found an existing slice to reuse
          console.log(
            `Found existing available slice ${row.id} for ${instanceId}. Re-leasing.`
          );
          // 3. Update lease holder & expiry for the found slice
          row = await tx.token_ranges.update({
            where: { id: row.id },
            data: {
              leased_by: instanceId,
              expires_at: new Date(Date.now() + 60000), // 1-min lease as per instructions
            },
          });
          console.log(
            `Re-leased slice ${
              row.id
            } to ${instanceId}. Expires at ${row.expires_at.toISOString()}`
          );
        } else {
          // No suitable existing slice found
          console.log(
            `No existing slice found for ${instanceId}, creating a new one.`
          );
          // 2. Append a brand-new slice after MAX(range_end)
          const maxResult = await tx.token_ranges.aggregate({
            _max: { range_end: true },
          });
          // If no rows exist yet, maxResult._max.range_end will be null. Start from 0.
          // Use BigInt for calculations as ranges can exceed Number.MAX_SAFE_INTEGER
          const lastEnd = maxResult._max.range_end ?? BigInt(-1);
          const newRangeStart = lastEnd + BigInt(1);
          const newRangeEnd = newRangeStart + BigInt(batchSize) - BigInt(1);

          console.log(
            `Creating new slice for ${instanceId}: ${newRangeStart} - ${newRangeEnd}`
          );

          row = await tx.token_ranges.create({
            data: {
              range_start: newRangeStart,
              range_end: newRangeEnd,
              next_value: newRangeStart, // Start next_value at the beginning of the new range
              leased_by: instanceId,
              expires_at: new Date(Date.now() + 60000), // 1-min lease
              // created_at is handled by default
            },
          });
          console.log(
            `Created new slice ${
              row.id
            } for ${instanceId}. Expires at ${row.expires_at.toISOString()}`
          );
        }
        return row;
      },
      {
        isolationLevel: "Serializable", // Ensure consistency
        maxWait: 5000, // Default
        timeout: 10000, // Abort transaction if it takes too long
      }
    );

    console.log(
      `Lease granted to ${instanceId}: Slice ID ${slice.id}, Range ${slice.range_start}-${slice.range_end}, Next value ${slice.next_value}`
    );
    // Return the relevant slice info to the Token Service
    res.json({
      range_start: String(slice.range_start), // Return as string to avoid JSON number limits
      range_end: String(slice.range_end),
      next_value: String(slice.next_value),
    });
  } catch (error) {
    console.error(`Error leasing range for ${instanceId}:`, error);
    // Check for specific transaction errors (e.g., timeout, serialization failure)
    if (
      error.code === "P2034" ||
      (error.message && error.message.includes("timeout"))
    ) {
      // Prisma transaction timeout or conflict
      res
        .status(503)
        .json({ error: "Service busy or transaction conflict, please retry." });
    } else {
      res
        .status(500)
        .json({ error: "Failed to lease range", details: error.message });
    }
  }
});

const port = process.env.PORT || 3003;
const server = app.listen(port, () =>
  console.log(`Token Range Service (TRS) up on port ${port}`)
);

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`${signal} signal received: closing HTTP server`);
  server.close(async () => {
    console.log("HTTP server closed");
    try {
      await prisma.$disconnect();
      console.log("Prisma client disconnected.");
      process.exit(0);
    } catch (e) {
      console.error("Error disconnecting Prisma client:", e);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
