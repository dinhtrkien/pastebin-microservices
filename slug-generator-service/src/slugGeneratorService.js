const { createCacheService } = require("./redis/cacheService");
const prismaClient = require("../prisma/prismaClient"); // Import Prisma client
const cacheService = createCacheService("slugs");

// Generate a random slug
function generateRandomSlug(length = 8) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return slug;
}

const slugGeneratorService = {
  // Generate a unique slug that isn't already in use (checks cache and DB)
  async generateUniqueSlug() {
    let slug;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loops

    while (!isUnique && attempts < maxAttempts) {
      slug = generateRandomSlug();
      attempts++;

      // 1. Check cache first (fast check for recently generated/used slugs)
      const cacheExists = await cacheService.exists(slug);
      if (cacheExists) {
        console.log(`Slug ${slug} found in cache, generating new one.`);
        continue; // Slug is in cache, generate a new one
      }

      // 2. If not in cache, check the database
      try {
        const dbPaste = await prismaClient.paste.findUnique({
          where: { slug },
          select: { id: true }, // Only select id for efficiency
        });

        if (dbPaste) {
          console.log(`Slug ${slug} found in database, generating new one.`);
          // Add the found slug to cache to speed up future checks
          await cacheService.set(slug, { used: true });
          continue; // Slug exists in DB, generate a new one
        }
      } catch (dbError) {
        console.error(`Database error checking slug ${slug}:`, dbError);
        // Decide how to handle DB errors - maybe retry or throw?
        // For now, we'll throw to indicate a problem.
        throw new Error("Database error during slug generation");
      }

      // 3. If not in cache and not in DB, the slug is unique
      isUnique = true;
    }

    if (!isUnique) {
      throw new Error(
        "Failed to generate a unique slug after multiple attempts"
      );
    }

    // 4. Reserve the unique slug in cache to prevent race conditions
    // Short TTL because paste-service should confirm or release it soon.
    const RESERVATION_TTL = 60; // 60 seconds
    await cacheService.set(slug, { reserved: true }, RESERVATION_TTL);
    console.log(`Slug ${slug} generated and reserved.`);
    return slug;
  },

  // Release a slug reservation if the paste creation fails in paste-service
  async releaseSlug(slug) {
    console.log(`Releasing reservation for slug: ${slug}`);
    await cacheService.delete(slug);
  },

  // Confirm slug is used by paste-service and extend cache duration
  async confirmSlugUsed(slug) {
    console.log(`Confirming usage for slug: ${slug}`);
    // Update cache entry to 'used' and extend TTL (e.g., 24 hours)
    const CONFIRMATION_TTL = 3600 * 24;
    await cacheService.set(slug, { used: true }, CONFIRMATION_TTL);
  },
};

module.exports = slugGeneratorService;
