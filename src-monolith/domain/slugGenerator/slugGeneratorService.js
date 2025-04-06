// Constants
const SLUG_LENGTH = 8;
const MAX_RETRY_ATTEMPTS = 5;

/**
 * Service responsible for generating unique slugs for pastes
 */
class SlugGeneratorService {
  /**
   * Create a slug generator
   * @param {Object} pasteRepo - Repository used to check for slug uniqueness
   */
  constructor(pasteRepo) {
    this.pasteRepo = pasteRepo;
    this.nanoidPromise = import('nanoid').catch(err => {
      console.error('Failed to load nanoid:', err);
      throw err;
    });
  }
  
  /**
   * Generate a unique slug with collision detection
   * @returns {Promise<string>} A unique slug
   */
  async generateUniqueSlug() {
    let attempts = 0;
    let slug;
    let existing;
    
    // Try to generate a unique slug with retry logic
    do {
      slug = await this.generateSlug();
      existing = await this.pasteRepo.findPasteBySlug(slug);
      attempts++;
    } while (existing && attempts < MAX_RETRY_ATTEMPTS);
    
    // If we still have a collision after all attempts, create a longer slug
    if (existing) {
      const { nanoid } = await this.nanoidPromise;
      slug = nanoid(SLUG_LENGTH + 4); // Use a longer slug as fallback
    }
    
    return slug;
  }
  
  /**
   * Generate a random slug using nanoid
   * @returns {Promise<string>} Random alphanumeric string
   */
  async generateSlug() {
    const { nanoid } = await this.nanoidPromise;
    return nanoid(SLUG_LENGTH);
  }
}

/**
 * Creates a new SlugGeneratorService instance
 * @param {Object} pasteRepo - Repository to check slug uniqueness
 * @returns {SlugGeneratorService} A new slug generator service instance
 */
const createSlugGeneratorService = (pasteRepo) => new SlugGeneratorService(pasteRepo);

module.exports = createSlugGeneratorService;