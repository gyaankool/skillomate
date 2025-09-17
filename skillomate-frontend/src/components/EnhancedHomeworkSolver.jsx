import React, { useState, useEffect } from 'react';
import { Send, BookOpen, Lightbulb, BarChart3, Download, Search, Settings } from 'lucide-react';
import config from '../../env-config.js';

const EnhancedHomeworkSolver = () => {
  const AI_SERVER_URL = config.AI_SERVER_URL;
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState({
    board: 'CBSE',
    grade: '8',
    subject: 'Mathematics'
  });
  const [mode, setMode] = useState('comprehensive');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [cacheStats, setCacheStats] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [availableDiagrams, setAvailableDiagrams] = useState(null);
  const [showDiagrams, setShowDiagrams] = useState(false);
  const [diagramLoading, setDiagramLoading] = useState(false);

  const boards = ['CBSE', 'ICSE', 'IB', 'State Board'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const subjects = [
    'Mathematics', 'Science', 'English', 'Hindi', 'Social Studies',
    'Computer Science', 'Physics', 'Chemistry', 'Biology', 'History',
    'Geography', 'Economics'
  ];
  const modes = [
    { value: 'comprehensive', label: 'Comprehensive', icon: BookOpen },
    { value: 'guided', label: 'Guided Learning', icon: Lightbulb },
    { value: 'diagram', label: 'Diagram Only', icon: BarChart3 },
    { value: 'offline', label: 'Offline Mode', icon: Download }
  ];

  useEffect(() => {
    fetchCacheStats();
  }, []);

  useEffect(() => {
    if (mode === 'diagram' && !availableDiagrams) {
      fetchAvailableDiagrams();
    }
  }, [context.subject, mode, availableDiagrams]);

  // Debug: Monitor response changes
  useEffect(() => {
    console.log('Response state changed:', response);
  }, [response]);

  const fetchAvailableDiagrams = async () => {
    try {
      const response = await fetch(`${AI_SERVER_URL}/api/available-diagrams?subject=${context.subject}`);
      const data = await response.json();
      if (data.success) {
        setAvailableDiagrams(data.available_diagrams);
      }
    } catch (error) {
      console.error('Error fetching available diagrams:', error);
    }
  };

  const fetchCacheStats = async () => {
    try {
              const response = await fetch(`${AI_SERVER_URL}/api/cache/stats`);
      const data = await response.json();
      if (data.success) {
        setCacheStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setResponse(null);
    setDiagramLoading(mode === 'diagram');

    try {
      let endpoint = '/api/homework';
      let payload = {
        question: question.trim(),
        context: context
      };

      if (mode === 'guided') {
        endpoint = '/api/guided-learning';
        payload.current_level = hintLevel;
      } else if (mode === 'diagram') {
        endpoint = '/api/diagram';
      }

              const response = await fetch(`${AI_SERVER_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      setResponse(data);
      
      if (data.success && mode === 'guided') {
        setHintLevel(data.hint_level);
      }
    } catch (error) {
      setResponse({
        success: false,
        error: 'Failed to connect to server. Please check if the server is running.'
      });
    } finally {
      setLoading(false);
      setDiagramLoading(false);
    }
  };

  const getNextHint = async () => {
    if (hintLevel >= 4) return;
    
    setLoading(true);
    try {
              const response = await fetch(`${AI_SERVER_URL}/api/guided-learning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          context: context,
          current_level: hintLevel + 1
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResponse(data);
        setHintLevel(data.hint_level);
      }
    } catch (error) {
      console.error('Error getting next hint:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDiagram = (diagram) => {
    console.log('Rendering diagram:', diagram); // Debug log
    if (!diagram || !diagram.image_data) {
      console.log('Diagram data missing:', diagram); // Debug log
      return null;
    }

    return (
      <div className="mt-4 p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800">
            📊 {diagram.description || 'Generated Diagram'}
          </h4>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {diagram.type || 'diagram'}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {diagram.complexity || 'moderate'}
            </span>
          </div>
        </div>
        
        <div className="relative">
          <img
            src={`data:image/png;base64,${diagram.image_data}`}
            alt={diagram.description || 'Generated Diagram'}
            className="max-w-full h-auto rounded-lg border-2 border-gray-200 shadow-sm"
            onLoad={() => console.log('Diagram image loaded successfully')}
            onError={(e) => {
              console.error('Failed to load diagram image');
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
            style={{ minHeight: '200px' }}
          />
          <div 
            className="hidden p-8 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
            style={{ display: 'none' }}
          >
            <div className="text-4xl mb-2">📊</div>
            <div>Diagram could not be loaded</div>
            <div className="text-sm">Please try again</div>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Type:</span> {diagram.type || 'Unknown'}
            </div>
            <div>
              <span className="font-medium">Complexity:</span> {diagram.complexity || 'Moderate'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResponse = () => {
    if (!response) return null;

    if (!response.success) {
      return (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 font-medium">Error</div>
          <div className="text-red-600">{response.error}</div>
        </div>
      );
    }

    return (
      <div className="mt-4 space-y-4">
        {/* Source indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            response.source === 'cache' ? 'bg-green-100 text-green-800' :
            response.source === 'ai_generated' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {response.source === 'cache' ? '📦 Cached' :
             response.source === 'ai_generated' ? '🤖 AI Generated' :
             response.source === 'offline_cache' ? '📱 Offline Cache' :
             response.source}
          </div>
          {response.metadata?.access_count && (
            <span className="text-gray-500">
              Accessed {response.metadata.access_count} times
            </span>
          )}
        </div>

        {/* Guided learning progress */}
        {mode === 'guided' && response.mode === 'guided' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-blue-800">
                Hint Level {response.hint_level} of {response.max_levels}
              </div>
              <div className="w-32 bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(response.hint_level / response.max_levels) * 100}%` }}
                ></div>
              </div>
            </div>
            {!response.is_complete && (
              <button
                onClick={getNextHint}
                disabled={loading}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Get Next Hint
              </button>
            )}
          </div>
        )}

        {/* Answer content */}
        {response.answer && mode !== 'diagram' && (
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="prose max-w-none">
              {response.answer.split('\n').map((line, index) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <h3 key={index} className="text-lg font-semibold text-gray-800 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                } else if (line.startsWith('**')) {
                  return <strong key={index} className="font-semibold">{line}</strong>;
                } else if (line.trim() === '') {
                  return <br key={index} />;
                } else {
                  return <p key={index} className="mb-2">{line}</p>;
                }
              })}
            </div>
          </div>
        )}

        {/* Diagram Loading State */}
        {diagramLoading && (
          <div className="mt-4 p-8 bg-white rounded-lg border shadow-sm text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Generating diagram...</div>
          </div>
        )}

        {/* Diagram */}
        {!diagramLoading && response.image_data && (
          <div key={`diagram-${response.diagram_type}-${response.subject}`}>
            {(() => {
              console.log('About to render diagram with data:', {
                hasImageData: !!response.image_data,
                diagramType: response.diagram_type,
                subject: response.subject
              });
              return renderDiagram({
                image_data: response.image_data,
                description: response.description || 'Generated Diagram',
                type: response.diagram_type || 'unknown',
                complexity: response.complexity || 'moderate'
              });
            })()}
          </div>
        )}

        {/* Diagram-only mode message */}
        {mode === 'diagram' && !response.image_data && response.success && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-yellow-800 font-medium">No Diagram Generated</div>
            <div className="text-yellow-600">
              Try asking for a specific diagram type like "triangle", "circle", "electric circuit", etc.
            </div>
          </div>
        )}

        {/* Context information */}
        {response.context && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-1">Detected Context:</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>Board: {response.context.board}</div>
                <div>Grade: {response.context.grade}</div>
                <div>Subject: {response.context.subject}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎓 GetSkilled Homework Helper
        </h1>
        <p className="text-gray-600">
          Intelligent, curriculum-aligned homework assistance for Indian students
        </p>
      </div>

      {/* Cache Stats */}
      {cacheStats && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{cacheStats.qa_entries}</div>
            <div className="text-sm text-blue-800">QA Entries</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{cacheStats.diagram_entries}</div>
            <div className="text-sm text-green-800">Diagrams</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{cacheStats.syllabus_entries}</div>
            <div className="text-sm text-purple-800">Syllabus</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{cacheStats.total_entries}</div>
            <div className="text-sm text-orange-800">Total</div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 bg-white p-6 rounded-lg border shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
              <select
                value={context.board}
                onChange={(e) => setContext({...context, board: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {boards.map(board => (
                  <option key={board} value={board}>{board}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <select
                value={context.grade}
                onChange={(e) => setContext({...context, grade: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {grades.map(grade => (
                  <option key={grade} value={grade}>Class {grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={context.subject}
                onChange={(e) => setContext({...context, subject: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {modes.map(modeOption => (
                  <option key={modeOption.value} value={modeOption.value}>
                    {modeOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Available Diagrams */}
      {showDiagrams && availableDiagrams && (
        <div className="mb-6 bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Available Diagrams for {context.subject}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableDiagrams.map((diagramType, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg border text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setQuestion(`Draw a ${diagramType} diagram`);
                  setShowDiagrams(false);
                }}
              >
                {diagramType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Click on any diagram type to set it as your question
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Ask Your Question</h2>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Settings size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your homework question here... (e.g., What is the area of a triangle with base 6cm and height 4cm?)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <BookOpen size={16} />
                  {context.board}
                </div>
                <div className="flex items-center gap-1">
                  <span>📚</span>
                  Class {context.grade}
                </div>
                <div className="flex items-center gap-1">
                  <span>📖</span>
                  {context.subject}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {mode === 'diagram' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDiagrams(!showDiagrams);
                      if (!availableDiagrams) {
                        fetchAvailableDiagrams();
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <BarChart3 size={16} />
                    Show Available Diagrams
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Get Answer
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Response Area */}
        <div className="p-6">
          {renderResponse()}
        </div>
      </div>

      {/* Features Overview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl mb-2">🎯</div>
          <h3 className="font-semibold text-gray-900">Context-Aware</h3>
          <p className="text-sm text-gray-600">Detects board, grade, and subject automatically</p>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl mb-2">🎓</div>
          <h3 className="font-semibold text-gray-900">Guided Learning</h3>
          <p className="text-sm text-gray-600">Progressive hints for step-by-step learning</p>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl mb-2">🎨</div>
          <h3 className="font-semibold text-gray-900">Smart Diagrams</h3>
          <p className="text-sm text-gray-600">Generate diagrams and charts automatically</p>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl mb-2">📱</div>
          <h3 className="font-semibold text-gray-900">Offline Ready</h3>
          <p className="text-sm text-gray-600">Works offline with cached content</p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHomeworkSolver;
