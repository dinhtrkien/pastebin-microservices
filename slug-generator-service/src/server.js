const express = require('express');
const cors = require('cors');
const slugGeneratorService = require('./slugGeneratorService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/slugs/generate', async (req, res) => {
  try {
    const slug = await slugGeneratorService.generateUniqueSlug();
    res.json({ slug });
  } catch (error) {
    console.error('Error generating slug:', error);
    res.status(500).json({ error: 'Failed to generate slug' });
  }
});

app.post('/api/slugs/:slug/release', async (req, res) => {
  try {
    const { slug } = req.params;
    await slugGeneratorService.releaseSlug(slug);
    res.json({ message: 'Slug released successfully' });
  } catch (error) {
    console.error('Error releasing slug:', error);
    res.status(500).json({ error: 'Failed to release slug' });
  }
});

app.post('/api/slugs/:slug/confirm', async (req, res) => {
  try {
    const { slug } = req.params;
    await slugGeneratorService.confirmSlugUsed(slug);
    res.json({ message: 'Slug confirmed successfully' });
  } catch (error) {
    console.error('Error confirming slug:', error);
    res.status(500).json({ error: 'Failed to confirm slug' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Slug Generator Service running on port ${PORT}`);
});