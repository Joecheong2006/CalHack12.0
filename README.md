# CalHack12.0: Smart README Generator

# AI Tutorial Generator

An intelligent learning tool that generates personalized, easy-to-understand tutorials on any topic using AI. Simply type what you want to learn, and get an instant, beautifully formatted HTML tutorial.

**✨ Now powered by Google Gemini API - Completely FREE for students!**

## Features

- 🎯 **Instant Tutorials** - Generate comprehensive tutorials in seconds
- 📚 **Easy to Understand** - Beginner-friendly explanations with simple language
- 💡 **Clear Examples** - Step-by-step instructions with practical examples
- 🎨 **Beautiful Formatting** - Clean HTML output with proper styling and structure
- ⚡ **Fast & Responsive** - Built with React for smooth user experience
- 🤖 **AI-Powered** - Uses Google Gemini 1.5 Flash (Free API)
- 🆓 **Completely Free** - No credit card required, perfect for students!

## How It Works

1. Enter your learning request in the input field
2. Click "Generate Tutorial" or press Enter
3. AI analyzes your request and creates a custom tutorial
4. Tutorial appears with formatted HTML including:
   - Clear headings and sections
   - Code examples (when relevant)
   - Lists and structured content
   - Highlighted key points
   - Easy-to-read styling

## Usage Examples

Try asking for tutorials on topics like:

- "How to make a website"
- "Python loops explained"
- "SQL basics for beginners"
- "What are React hooks?"
- "How to use CSS Flexbox"
- "Explain machine learning"
- "JavaScript promises tutorial"

## Technical Stack

- **Frontend**: React with Hooks (useState)
- **Backend**: Node.js + Express
- **Styling**: Tailwind CSS utility classes
- **Icons**: Lucide React
- **AI Model**: Google Gemini 1.5 Flash (FREE)
- **API**: Google Generative AI API

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- **Google Gemini API Key** (FREE - get it at https://ai.google.dev)

### Get Your Free API Key

1. Go to https://ai.google.dev
2. Click "Get API key in Google AI Studio"
3. Sign in with your Google account
4. Click "Create API Key"
5. Copy your API key (starts with `AIzaSy...`)

### Installation (One Command!)

```bash
npx create-react-app tutorial-generator && cd tutorial-generator && npm install lucide-react tailwindcss postcss autoprefixer express cors dotenv && npx tailwindcss init -p
```

### Setup Steps

1. **Configure Tailwind** - Replace content in `tailwind.config.js`:
   ```javascript
   module.exports = {
     content: ["./src/**/*.{js,jsx,ts,tsx}"],
     theme: { extend: {} },
     plugins: [],
   }
   ```

2. **Add Tailwind directives** - Replace content in `src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. **Create `.env` file** in project root:
   ```
   GEMINI_API_KEY=AIzaSy-your-actual-key-here
   ```

4. **Create `server.js`** in project root - Copy the backend server code

5. **Add the component** - Replace content in `src/App.js` with the AI Tutorial Generator component code

6. **Run both servers**:
   
   **Terminal 1 - Backend:**
   ```bash
   node server.js
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm start
   ```

### All npm Commands

```bash
# Install dependencies
npm install

# Start frontend development server
npm start

# Start backend server (in separate terminal)
node server.js

# Build for production
npm run build

# Run tests
npm test
```

### API Authentication Note

⚠️ **For local deployment**: The Anthropic API requires authentication. In Claude.ai, this is handled automatically. For external use, you'll need to:
- Set up a backend proxy to handle API requests securely
- Store your API key in environment variables (never in frontend code)
- Update the fetch URL to call your backend instead of Anthropic directly

## API Configuration

The application uses the Google Gemini API with the following configuration:

- **Model**: gemini-1.5-flash (Free tier)
- **Endpoint**: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
- **Free Tier Limits**: 
  - 60 requests per minute
  - 1,500 requests per day
  - No credit card required!

### Getting Your Free API Key

1. Visit https://ai.google.dev
2. Sign in with your Google account
3. Click "Get API Key" in Google AI Studio
4. Create a new API key
5. Copy and paste it into your `.env` file

### Security Note

⚠️ **Never commit API keys to version control**. The `.env` file should be in your `.gitignore` (already included in the setup).

## Component Structure

```
Project Root
├── src/
│   ├── App.js (React frontend)
│   ├── index.js
│   └── index.css (Tailwind styles)
├── server.js (Express backend)
├── .env (API key - DO NOT COMMIT)
├── package.json
└── tailwind.config.js

Backend (server.js)
├── Express server on port 3001
├── CORS enabled for frontend
├── Health check endpoint (/)
└── Tutorial generation endpoint (/api/generate-tutorial)

Frontend (App.js)
├── State Management
│   ├── request (user input)
│   ├── tutorial (generated HTML)
│   ├── loading (loading state)
│   └── error (error messages)
├── Input Section
│   ├── Text input field
│   └── Generate button
├── Tutorial Display
│   └── HTML rendered content
└── Styling
    └── Custom CSS for formatted output
```

## Tutorial Output Format

Generated tutorials include:

- `<h1>` - Main title
- `<h2>` - Section headings
- `<h3>` - Subsection headings
- `<p>` - Paragraph content
- `<ul>` / `<ol>` - Lists
- `<pre><code>` - Code blocks
- `<strong>` - Important points
- `<em>` - Emphasized text

## Customization

### Changing the AI Model

The backend uses Google Gemini 1.5 Flash (free tier). If you want to use a different model:

```javascript
// In server.js, change the model in the URL:
const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
```

Available free models:
- `gemini-2.5-flash` (faster, recommended)
- `gemini-2.5-pro` (more capable, slower)

### Adjusting Tutorial Length

Gemini doesn't have a max_tokens parameter like other APIs, but you can adjust the prompt to request shorter or longer tutorials.

### Styling Modifications

Edit the custom CSS in the `<style>` tag at the bottom of the component to adjust:

- Colors
- Font sizes
- Spacing
- Code block styling
- Heading styles

## Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Limitations

- Tutorial content is generated by AI and should be verified for accuracy
- Free tier has rate limits (60 requests/minute, 1,500/day)
- Requires internet connection for API calls
- Backend server must be running for the app to work

## Troubleshooting

### "Backend not reachable" error
- Make sure you're running `node server.js` in a separate terminal
- Check that port 3001 is not already in use

### "API key not configured" error
- Verify your `.env` file exists in the project root
- Check that the variable is named `GEMINI_API_KEY`
- Restart the backend server after creating/editing `.env`

### "Model not found" error
- Ensure you have a valid Google API key
- Check that you're using `gemini-1.5-flash` in server.js
- Visit https://ai.google.dev to verify your API key is active

## Future Enhancements

Potential features to add:

- [ ] Save/export tutorials as PDF or markdown
- [ ] Tutorial history and favorites
- [ ] Difficulty level selection (beginner/intermediate/advanced)
- [ ] Language selection for tutorials
- [ ] Interactive code examples with live editing
- [ ] Progress tracking for learning paths
- [ ] Sharing tutorials via URL

## Contributing

Feel free to fork this project and submit pull requests for improvements!

## License

This project is open source and available for educational purposes.

## Support

If you encounter issues or have questions:

1. Check the browser console for error messages (F12)
2. Check the backend terminal for server logs
3. Verify your API key at https://ai.google.dev
4. Ensure both frontend and backend servers are running
5. Check that your `.env` file is properly configured

## Acknowledgments

- Built with React
- Powered by Google Gemini AI (Free API)
- Icons by Lucide
- Styling with Tailwind CSS

---

**Happy Learning!** 🚀📚

*Perfect for students, completely free, no credit card required!*
