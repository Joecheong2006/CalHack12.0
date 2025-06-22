import React, { useState } from 'react';
import { BookOpen, Sparkles, Loader } from 'lucide-react';

export default function AILearningTool() {
  const [request, setRequest] = useState('');
  const [tutorial, setTutorial] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">AI Tutorial Generator</h1>
          </div>
          <p className="text-gray-600 text-lg">Ask anything and get an easy-to-understand tutorial instantly!</p>
          <p className="text-sm text-indigo-500 mt-2">✨ Powered by Google Gemini (Free API)</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-semibold">⚠️ Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}
          <label className="block text-gray-700 font-semibold mb-3 text-lg">
            What do you want to learn?
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., How to make a website, Python loops, SQL basics, React hooks..."
              className="flex-1 px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition"
              disabled={loading}
            />
            <button
              onClick={generateTutorial}
              disabled={loading || !request.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Tutorial
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tutorial Display */}
        {tutorial && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
              <h2 className="text-white font-semibold text-xl flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Your Tutorial
              </h2>
            </div>
            <div 
              className="p-8 prose prose-lg max-w-none"
              style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#1f2937'
              }}
              dangerouslySetInnerHTML={{ __html: tutorial }}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Creating your personalized tutorial...</p>
          </div>
        )}

        {/* Empty State */}
        {!tutorial && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Sparkles className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Ready to Learn?</h3>
            <p className="text-gray-600 mb-6">Type your question above and click generate to get started!</p>
            
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-indigo-600 font-semibold mb-2">💡 Clear Examples</div>
                <div className="text-sm text-gray-600">Step-by-step with practical examples</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 font-semibold mb-2">📚 Easy Language</div>
                <div className="text-sm text-gray-600">Beginner-friendly explanations</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 font-semibold mb-2">⚡ Instant Results</div>
                <div className="text-sm text-gray-600">Get tutorials in seconds</div>
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
          color: #1f2937;
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5em;
          margin-top: 0;
        }
        
        .prose h2 {
          color: #374151;
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.3em;
        }
        
        .prose h3 {
          color: #4b5563;
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1.2em;
          margin-bottom: 0.5em;
        }
        
        .prose p {
          margin-bottom: 1em;
        }
        
        .prose ul, .prose ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .prose li {
          margin-bottom: 0.5em;
        }
        
        .prose code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: #be185d;
        }
        
        .prose pre {
          background-color: #1f2937;
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
          color: #6366f1;
          font-weight: 600;
        }
        
        .prose em {
          color: #8b5cf6;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
