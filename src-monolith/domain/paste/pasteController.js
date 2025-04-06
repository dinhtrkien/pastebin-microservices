const pasteService = require("./pasteService.js");

module.exports = {
  showCreatePastePage(req, res) {
    // Renders the create paste form
    res.render("createPasteView");
  },

  async createPaste(req, res) {
    try {
      const { content, expirationType } = req.body;
      
      // Convert expiration type to actual date
      let expirationTime = null;
      const now = new Date();
      
      switch (expirationType) {
        case "burn": // Keep for backward compatibility
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
        default:
          expirationTime = null; // "never"
      }
      
      const newPaste = await pasteService.createPaste(content, expirationTime);
      
      // Redirect to the detail page
      res.redirect(`/paste/${newPaste.slug}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating paste");
    }
  },

  async showDetailPage(req, res) {
    try {
      const { slug } = req.params;
      const paste = await pasteService.getPaste(slug);

      if (!paste) {
        return res.status(404).render("notFoundView");
      }

      res.render("detailPasteView", { paste });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving paste");
    }
  }
};