// Server setup and start
const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

// Import route files
const routes = require('./routes/index');

// Import cleanup service
const cleanupService = require('./domain/cleanup/cleanupService');

// EJS setup
app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "domain/paste"), 
  path.join(__dirname, "domain/analytics") 
]);

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for parsing form data
app.use(express.static("public")); // serve static files if needed

// Routes setup
app.use("/", routes);
// app.use("/analytics", analyticsRoutes);

// Initialize cleanup service
cleanupService.initialize();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Monolithic app listening on port http://localhost:${PORT}`);
});