const pasteService = require("./pasteService");

/**
 * Controller handling HTTP requests for paste operations
 */
const pasteController = {
  /**
   * Create a new paste
   * @param {Request} req - Express request object
   * @param {Object} res - Express response object
   */
  async createPaste(req, res) {
    try {
      const { content, expirationType } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      // Convert expiration type to actual date
      let expirationTime = null;
      const now = new Date();

      switch (expirationType) {
        case "1m":
          expirationTime = new Date(now.getTime() + 1 * 60 * 1000);
          break;
        case "5m":
          expirationTime = new Date(now.getTime() + 5 * 60 * 1000);
          break;
        case "10m":
          expirationTime = new Date(now.getTime() + 10 * 60 * 1000);
          break;
        case "1h":
          expirationTime = new Date(now.getTime() + 60 * 60 * 1000);
          break;
        case "1d":
          expirationTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case "1w":
          expirationTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case "2w":
          expirationTime = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
          break;
        case "1mo":
          expirationTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        case "6mo":
          expirationTime = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
          break;
        case "1y":
          expirationTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          break;
        case "never":
        default:
          expirationTime = null;
      }

      const newPaste = await pasteService.createPaste(content, expirationTime);

      res.status(201).json({
        id: newPaste.id,
        slug: newPaste.slug,
        content: newPaste.content,
        createdAt: newPaste.createdAt,
        expirationTime: newPaste.expirationTime,
        viewsCount: 0,
      });
    } catch (error) {
      console.error("Create paste error:", error);
      res.status(500).json({ error: "Failed to create paste" });
    }
  },

  /**
   * Get a paste by its slug
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPaste(req, res) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({ error: "Slug parameter is required" });
      }

      const paste = await pasteService.getPaste(slug);

      if (!paste) {
        return res.status(404).json({ error: "Paste not found or expired" });
      }

      res.json({
        id: paste.id,
        slug: paste.slug,
        content: paste.content,
        createdAt: paste.createdAt,
        expirationTime: paste.expirationTime,
        viewsCount: paste.viewsCount,
      });
    } catch (error) {
      console.error(`Get paste error for slug ${req.params.slug}:`, error);
      res.status(500).json({ error: "Failed to retrieve paste" });
    }
  },
};



module.exports = pasteController;
