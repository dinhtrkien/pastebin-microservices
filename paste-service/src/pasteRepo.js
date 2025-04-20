const prismaClient = require("../prisma/prismaClient.js");

/**
 * Repository for paste-related database operations
 */
const pasteRepo = {
  /**
   * Create a new paste
   * @param {string} slug - Unique identifier for the paste
   * @param {string} content - Content of the paste
   * @param {Date|null} expirationTime - When the paste expires, or null for never
   * @returns {Promise<Object>} Created paste object
   */
  async createPaste(slug, content, expirationTime) {
    const paste = await prismaClient.paste.create({
      data: {
        slug,
        content,
        createdAt: new Date(),
        expirationTime: expirationTime || null,
        viewsCount: 0,
      },
    });
    return paste;
  },

  /**
   * Find a paste by its slug
   * @param {string} slug - The paste's unique slug
   * @returns {Promise<Object|null>} The paste or null if not found
   */
  async findPasteBySlug(slug) {
    return prismaClient.paste.findUnique({ where: { slug } });
  },

  /**
   * Increment the view count for a paste
   * @param {string} slug - The paste's unique slug
   * @returns {Promise<void>}
   */
  async incrementViews(slug) {
    await prismaClient.paste.update({
      where: { slug },
      data: { viewsCount: { increment: 1 } },
    });
  },

  /**
   * Delete a paste by its slug
   * @param {string} slug - The paste's unique slug
   * @returns {Promise<Object>} The deleted paste
   */
  async deletePaste(slug) {
    return prismaClient.paste.delete({
      where: { slug },
    });
  },

  /**
   * Check if a paste is expired
   * @param {Object} paste - The paste object
   * @returns {boolean} True if the paste is expired
   */
  isPasteExpired(paste) {
    return paste.expirationTime && new Date() > new Date(paste.expirationTime);
  },
};

module.exports = pasteRepo;
