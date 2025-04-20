const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const pasteRoutes = require("./pasteRoutes");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", pasteRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Paste service running on port ${PORT}`);
});
