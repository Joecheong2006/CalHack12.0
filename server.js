// server.js - Backend server with Google Gemini API (FREE)
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Backend server is running!' });
});

// ------------------------------
// 📌 ListModels Endpoint
// ------------------------------
app.get('/api/list-models', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log("🔍 ListModels endpoint hit");

  if (!apiKey) {
    console.log("❌ No API key found");
    return res.status(500).json({ error: 'API key missing' });
  }

  try {
    console.log("📥 Fetching models from Google...");

    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    console.log("🌐 URL:", url);

    const response = await fetch(url);
    console.log("📤 Google response status:", response.status);

    const data = await response.text();
    console.log("📦 Raw body:", data);

    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      console.log("⚠️ Could not parse JSON");
      parsed = { raw: data };
    }

    res.json(parsed);

  } catch (err) {
    console.error("🔥 Fatal error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// ------------------------------
// 📌 Tutorial Generation Endpoint
// ------------------------------
app.post('/api/generate-tutorial', async (req, res) => {
  console.log('📥 Received request for tutorial generation');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ API key not found in environment variables');
    return res.status(500).json({ 
      error: 'API key not configured on server. Get a free key at: https://ai.google.dev' 
    });
  }

  try {
    const { request } = req.body;
    
    console.log('📤 Forwarding request to Google Gemini API...');
    console.log('Request topic:', request);

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create an easy-to-understand tutorial for: "${request}"

Format your response as clean HTML with:
- A clear title using <h1>
- Section headings using <h2> and <h3>
- Step-by-step explanations in <p> tags
- Code examples in <pre><code> blocks if relevant
- Important points in <strong> or <em> tags
- Lists using <ul> or <ol> when appropriate
- Visual structure with proper spacing

Make it beginner-friendly, clear, and engaging. Use simple language and include practical examples.

Return ONLY the HTML content without any preamble, markdown backticks, or explanations. Start directly with the HTML.`
            }]
          }]
        })
      }
    );

    console.log('📥 Response from Gemini:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Gemini API error:', errorData);
      return res.status(response.status).json({
        error: errorData.error?.message || 'API request failed'
      });
    }

    const data = await response.json();
    console.log('✅ Tutorial generated successfully');
    
    const tutorialText = data.candidates[0]?.content?.parts[0]?.text 
      || 'Sorry, could not generate tutorial.';
    
    res.json({
      content: [{
        type: 'text',
        text: tutorialText
      }]
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
});

// ------------------------------
// Start server
// ------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`✅ CORS enabled for frontend requests`);
  console.log(`🔑 API key loaded: ${!!process.env.GEMINI_API_KEY}`);
  console.log(`📚 Using Google Gemini API (FREE)`);
});
