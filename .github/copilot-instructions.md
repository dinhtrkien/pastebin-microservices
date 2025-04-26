Building a Collision-Free Token-Range Slug Generator Solution

1. (DONE) Create the token_ranges table

- Create this table inside the main PostgreSQL database

- Reference:

CREATE TABLE token_ranges (
  id           BIGSERIAL PRIMARY KEY,            -- one row == one numeric slice
  range_start  BIGINT      NOT NULL,
  range_end    BIGINT      NOT NULL,
  next_value   BIGINT      NOT NULL,
  leased_by    TEXT        NOT NULL,             -- token-service instance ID
  expires_at   TIMESTAMPTZ NOT NULL,             -- optional TTL/lease
  created_at   TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT   chk_bounds CHECK (
                 range_start <= next_value AND next_value <= range_end
               )
);

CREATE UNIQUE INDEX ON token_ranges (range_start, range_end);

- All slices start out empty; the first request will allocate the first slice automatically—no pre-seeding necessary.

2. (DONE) Build and run the Token-Range Service (TRS)
A very small Express app that leases numeric slices.

- Reference code:
// src/trs.js
import express from "express";
import { prisma } from "./prisma";          // Prisma points to the Pastebin DB
const app = express();
app.use(express.json());

app.post("/leaseRange", async (req, res) => {
  const { instanceId, batchSize = 10_000 } = req.body;

  const slice = await prisma.$transaction(async (tx) => {
    // 1. Try to grab an unused portion of an existing slice
    let row = await tx.$queryRaw`
      SELECT * FROM token_ranges
      WHERE leased_by = 'UNALLOCATED' AND next_value < range_end
      LIMIT 1
      FOR UPDATE SKIP LOCKED`;

    if (!row) {
      // 2. Or append a brand-new slice after MAX(range_end)
      const lastEnd: number =
        (await tx.token_ranges.aggregate({ _max: { range_end: true } }))._max
          .range_end ?? -1;

      row = await tx.token_ranges.create({
        data: {
          range_start: lastEnd + 1,
          range_end:   lastEnd + batchSize,
          next_value:  lastEnd + 1,
          leased_by:   instanceId,
          expires_at:  new Date(Date.now() + 60_000)   // 1-min lease
        }
      });
    } else {
      // 3. Update lease holder & expiry
      row = await tx.token_ranges.update({
        where: { id: row.id },
        data : { leased_by: instanceId,
                 expires_at: new Date(Date.now() + 60_000) }
      });
    }
    return row;
  }, { isolationLevel: "Serializable" });

  res.json(slice);
});

app.listen(3001, () => console.log("TRS up on :3001"));

- The TRS is stateless—run as many replicas as you like.

3. Implement the Token Service (TS)
- Each TS is a Key-Generation Server running in its own container.
- Boot sequence:
    + Generate a unique instanceId (e.g., ${hostname}-${Date.now()}).
    + POST /leaseRange to the TRS to obtain the first numeric slice.
    + Persist [range_start, range_end, next_value] in process memory and (optionally) a local Redis instance so a pod crash does not waste remaining keys.
- Fast path — served in-process (reference code):
    const id = atomicCounter.increment();
    if (id <= range_end) return encodeBase62Fixed(id);   // O(1)
- Slow path — slice exhausted:
    + Synchronously request a new slice from TRS.
    + For smoother traffic, pre-fetch when > 90 % of the current slice is consumed.

4. Integrate with the Paste Service
- Reference code:
    app.post("/pastes", async (req, res) => {
    const slug = await tokenService.getSlug();         // 1. 8-char slug
    await prisma.paste.create({                       // 2. persist paste meta
        data: { id: decodeBase62(slug), slug, content: req.body.text }
    });
    res.json({ slug });
    });

- Both the Paste service and each Token Service run in separate containers.
- Use an internal HTTP call (same cluster network) for GET /slug.

5. Local Base-62 encoder/decoder (fixed 8 chars)
- reference code:
    const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    /** Encode a positive integer as an 8-character base-62 string, left-padded with zeros. */
    export function encodeBase62Fixed(num: number): string {
    let s = "";
    do { s = ALPHABET[num % 62] + s; num = Math.floor(num / 62); } while (num);
    return s.padStart(8, "0");         // guarantees 8-char slug
    }

    /** Reverse operation (optional). */
    export function decodeBase62(slug: string): number {
    let n = 0;
    for (const c of slug) n = n * 62 + ALPHABET.indexOf(c);
    return n;
    }
- Place this helper inside the Token Service so no extra network hop is required.