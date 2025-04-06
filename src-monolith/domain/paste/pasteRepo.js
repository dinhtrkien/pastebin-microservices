// Implementation of Paste repository
const prismaClient = require("../../../prisma/prismaClient.js");

module.exports = {
  async createPaste(slug, content, expirationTime) {
    const paste = await prismaClient.paste.create({
      data: {
        slug,
        content,
        createdAt: new Date(),
        expirationTime: expirationTime || null,
        viewsCount: 0
      }
    });
    return paste;
  },

  async findPasteBySlug(slug) {
    return prismaClient.paste.findUnique({ where: { slug } });
  },

  async incrementViews(slug) {
    await prismaClient.paste.update({
      where: { slug },
      data: { viewsCount: { increment: 1 } }
    });
  },

  async deletePaste(slug) {
    await prismaClient.paste.delete({
      where: { slug }
    });
  },
};
