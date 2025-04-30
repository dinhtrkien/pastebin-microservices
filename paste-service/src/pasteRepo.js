const prismaClient = require("../prisma/prismaClient.js");

const pasteRepo = {
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

  async findPasteBySlug(slug) {
    return prismaClient.paste.findUnique({ where: { slug } });
  },

  // async incrementViews(slug) {
  //   await prismaClient.paste.update({
  //     where: { slug },
  //     data: { viewsCount: { increment: 1 } },
  //   });
  // },

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
