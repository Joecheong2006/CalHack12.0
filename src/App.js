import React, { useState } from 'react';
import { BookOpen, Sparkles, Loader, Moon, Sun } from 'lucide-react';

export default function AILearningTool() {
  const [request, setRequest] = useState('');
  const [tutorial, setTutorial] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Debug: Check backend connection on component mount
  React.useEffect(() => {
    console.log('=== BACKEND CONNECTION CHECK ===');
    fetch('http://localhost:3001/')
      .then(res => res.json())
      .then(data => console.log('✅ Backend status:', data))
      .catch(err => console.error('❌ Backend not reachable:', err.message));
    console.log('===============================');
  }, []);

  const generateTutorial = async () => {
    if (!request.trim()) return;

    console.log('🔍 Starting tutorial generation...');
    
    setLoading(true);
    setTutorial('');
    setError('');
    
    try {
      console.log('📤 Sending request to backend...');
      const response = await fetch('http://localhost:3001/api/generate-tutorial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request: request
        })
      });

      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Backend request failed');
      }
      
      let htmlContent = data.content.find(block => block.type === 'text')?.text || '<p>Sorry, I could not generate a tutorial.</p>';
      
      console.log('✅ Tutorial generated successfully');
      
      // Clean up any markdown code fences if present
      htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
      
      setTutorial(htmlContent);
    } catch (error) {
      console.error('❌ Error details:', error);
      console.error('Error message:', error.message);
      
      const errorMessage = `Error: ${error.message}. Check the browser console for details.`;
      setTutorial(`<p style="color: #ef4444;">${errorMessage}</p>`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      generateTutorial();
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'} p-6 transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto">
        {/* Dark Mode Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-700'} shadow-lg hover:scale-110 transition-transform duration-200`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <BookOpen className={`w-10 h-10 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>How to Start</h1>
          </div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Get started with anything - instant beginner guides powered by AI</p>
          <p className={`text-sm mt-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>✨ Powered by Google Gemini (Free API)</p>
        </div>

        {/* Input Section */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 mb-6 transition-colors duration-300`}>
          {error && (
            <div className={`mb-4 p-4 ${darkMode ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'} border rounded-lg`}>
              <p className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>⚠️ Error</p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
            </div>
          )}
          <label className={`block font-semibold mb-3 text-lg ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            What do you want to start learning?
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., How to start with Python, Getting into photography, Starting web development..."
              className={`flex-1 px-5 py-4 text-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'} rounded-xl focus:border-green-500 focus:outline-none transition`}
              disabled={loading}
            />
            <button
              onClick={generateTutorial}
              disabled={loading || !request.trim()}
              className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Get Started
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tutorial Display */}
        {tutorial && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden animate-fadeIn transition-colors duration-300`}>
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4">
              <h2 className="text-white font-semibold text-xl flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Your Getting Started Guide
              </h2>
            </div>
            <div 
              className={`p-8 prose prose-lg max-w-none ${darkMode ? 'prose-invert' : ''}`}
              style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: darkMode ? '#e5e7eb' : '#1f2937'
              }}
              dangerouslySetInnerHTML={{ __html: tutorial }}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-12 text-center transition-colors duration-300`}>
            <Loader className={`w-12 h-12 ${darkMode ? 'text-orange-400' : 'text-orange-600'} animate-spin mx-auto mb-4`} />
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Creating your personalized getting started guide...</p>
          </div>
        )}

        {/* Empty State */}
        {!tutorial && !loading && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-12 text-center transition-colors duration-300`}>
            <Sparkles className={`w-16 h-16 ${darkMode ? 'text-orange-400' : 'text-orange-500'} mx-auto mb-4`} />
            <h3 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ready to Begin?</h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tell us what you want to start learning, and we'll create a personalized beginner guide for you!</p>
            
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              <div className={`${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'} p-4 rounded-lg`}>
                <div className={`font-semibold mb-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>🚀 Quick Start</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Get moving fast with essential first steps</div>
              </div>
              <div className={`${darkMode ? 'bg-orange-900/20' : 'bg-orange-50'} p-4 rounded-lg`}>
                <div className={`font-semibold mb-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>📚 Beginner-Friendly</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No prior knowledge required</div>
              </div>
              <div className={`${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'} p-4 rounded-lg`}>
                <div className={`font-semibold mb-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>⚡ Instant Guides</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Get your guide in seconds</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .prose h1 {
          color: ${darkMode ? '#f3f4f6' : '#1f2937'};
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5em;
          margin-top: 0;
        }
        
        .prose h2 {
          color: ${darkMode ? '#e5e7eb' : '#374151'};
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          border-bottom: 2px solid ${darkMode ? '#4b5563' : '#e5e7eb'};
          padding-bottom: 0.3em;
        }
        
        .prose h3 {
          color: ${darkMode ? '#d1d5db' : '#4b5563'};
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1.2em;
          margin-bottom: 0.5em;
        }
        
        .prose p {
          margin-bottom: 1em;
          color: ${darkMode ? '#e5e7eb' : '#1f2937'};
        }
        
        .prose ul, .prose ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .prose li {
          margin-bottom: 0.5em;
          color: ${darkMode ? '#e5e7eb' : '#1f2937'};
        }
        
        .prose code {
          background-color: ${darkMode ? '#374151' : '#f3f4f6'};
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: ${darkMode ? '#ec4899' : '#be185d'};
        }
        
        .prose pre {
          background-color: ${darkMode ? '#1f2937' : '#1f2937'};
          color: #f3f4f6;
          padding: 1.5em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1.5em 0;
        }
        
        .prose pre code {
          background-color: transparent;
          padding: 0;
          color: #f3f4f6;
          font-size: 0.95em;
        }
        
        .prose strong {
          color: ${darkMode ? '#fb923c' : '#ea580c'};
          font-weight: 600;
        }
        
        .prose em {
          color: ${darkMode ? '#fdba74' : '#f97316'};
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
