const express = require("express");
const dotenv = require("dotenv");
const tokenService = require("./tokenService.js");

dotenv.config();

const app = express();
const port = process.env.TOKEN_SERVICE_PORT || 3004;

app.use(express.json());

// Initialize Token Service on startup
(async () => {
  try {
    await tokenService.initialize();
    console.log("Token Service initialized successfully.");

    // Define routes only after successful initialization
    app.get("/slug", async (req, res) => {
      try {
        const slug = await tokenService.getSlug();
        res.json({ slug });
      } catch (error) {
        console.error("Error generating slug:", error);
        res
          .status(500)
          .json({ error: "Failed to generate slug", details: error.message });
      }
    });

    app.listen(port, () => {
      console.log(`Token Service (TS) running on port ${port}`);
    });
  } catch (error) {
    console.error(
      "Failed to initialize Token Service. Server not starting.",
      error
    );
    process.exit(1); // Exit if initialization fails
  }
})();

// Optional: Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", instanceId: tokenService.instanceId });
});
