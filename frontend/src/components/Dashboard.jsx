import { useState, useEffect } from 'react';
import { BookOpen, Plus, LogOut, Brain, Sparkles, Target, Menu, List, Home, BarChart3, X, Clock } from 'lucide-react';
import apiClient from '../api';
import ReviewSession from './ReviewSession';
import AddWordModal from './AddWordModal';
import WordSuggestions from './WordSuggestions';

function Dashboard({ setToken }) {
  // Your original working state management
  const [words, setWords] = useState([]);
  const [error, setError] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [wordToExplain, setWordToExplain] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // Additional state for modern UI
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoadingWords, setIsLoadingWords] = useState(false);

  // Your original working fetchWords function
  const fetchWords = async () => {
    try {
      setIsLoadingWords(true);
      const response = await apiClient.get('/words/');
      setWords(response.data);
    } catch (err) {
      setError('Could not fetch words.');
    } finally {
      setIsLoadingWords(false);
    }
  };

  // Your original useEffect
  useEffect(() => {
    if (!isReviewing) {
      fetchWords();
    }
  }, [isReviewing]);

  // Your original working handlers
  const handleLogout = () => {
    setToken(null);
  };

  const handleGetSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setError('');
    try {
      const response = await apiClient.get('/ai/suggest-words/');
      setSuggestions(response.data.suggestions);
    } catch (err) {
      setError("Could not fetch suggestions.");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSuggestionClick = (word) => {
    setWordToExplain(word);
    setIsAddingWord(true);
  };

  const handleAddNewWordClick = () => {
    setWordToExplain('');
    setIsAddingWord(true);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'wordlist', label: 'My Words', icon: List },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  // Your original review session condition
  if (isReviewing) {
    return <ReviewSession onFinishSession={() => setIsReviewing(false)} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900 flex">
        {/* Modern Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-md border-r border-gray-200 shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center space-x-3 p-6 mb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">VocabMaster</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              {sidebarItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    currentPage === item.id 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
        
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="sticky top-0 lg:hidden bg-white/95 backdrop-blur-md border-b border-gray-200 z-20">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">VocabMaster</span>
              </div>
              <div className="w-10" />
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-10">
            {currentPage === 'dashboard' && (
              <>
                {/* Header */}
                <div className="mb-12">
                  <h1 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
                    My Vocabulary
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl">
                    Expand your vocabulary, one word at a time. Master new words and unlock the power of language.
                  </p>
                </div>
                
                <div className="max-w-6xl mx-auto space-y-8">
                  {/* Add New Word Card */}
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 shadow-2xl text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Plus className="w-7 h-7" />
                          </div>
                          <h2 className="text-2xl font-bold">Add New Word</h2>
                        </div>
                        <p className="text-green-100 mb-6 max-w-lg leading-relaxed">
                          Discover and master a new word. Every word learned is a step towards better communication.
                        </p>
                        <button 
                          onClick={handleAddNewWordClick}
                          className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
                        >
                          + Add New Word
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Review Session Card */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Target className="w-7 h-7" />
                          </div>
                          <h2 className="text-2xl font-bold">Ready to learn?</h2>
                        </div>
                        <p className="text-indigo-100 mb-6 max-w-lg leading-relaxed">
                          You have words due for review. Start a session to continue learning.
                        </p>
                        <button
                          onClick={() => setIsReviewing(true)}
                          className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
                        >
                          Start Review Session
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Word Suggestions Card */}
                  <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Need Inspiration?</h2>
                        <p className="text-gray-600">Let our AI suggest some new words for you to learn.</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleGetSuggestions}
                      disabled={isLoadingSuggestions}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-6"
                    >
                      {isLoadingSuggestions ? 'Thinking...' : 'Suggest Words for Me'}
                    </button>
                    <WordSuggestions 
                      suggestions={suggestions}
                      onSelectWord={handleSuggestionClick}
                      isLoading={isLoadingSuggestions}
                    />
                  </div>
                </div>
              </>
            )}
            
            {currentPage === 'wordlist' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <span>My Word List</span>
                    <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                      {words.length} {words.length === 1 ? 'word' : 'words'}
                    </span>
                  </h2>

                  {isLoadingWords ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="animate-pulse p-6 rounded-2xl bg-gray-100">
                          <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : words.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f9fafb'}}>
                      {words.map((word) => (
                        <div
                          key={word.id}
                          className="group p-6 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300"
                        >
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors capitalize">
                            {word.text}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {word.definition}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Your vocabulary awaits</h3>
                      <p className="text-gray-500 mb-6">Your vocabulary list is empty. Add a new word or get some suggestions!</p>
                      <div className="inline-flex items-center space-x-2 text-indigo-600 font-medium">
                        <Plus className="w-4 h-4" />
                        <span>Add your first word</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {currentPage === 'analytics' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
                  <p className="text-gray-600 text-lg mb-8">
                    Coming soon! Track your learning progress and vocabulary growth with detailed insights.
                  </p>
                  <div className="inline-flex items-center space-x-2 text-indigo-600 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Feature in development</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Your original error handling */}
            {error && (
              <div className="mt-6 max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-red-600" />
                    </div>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      
      {/* Your original modal logic */}
      {isAddingWord && (
        <AddWordModal 
          initialWord={wordToExplain}
          onClose={() => setIsAddingWord(false)} 
          onWordAdded={() => { fetchWords(); setSuggestions([]); }}
        />
      )}
    </>
  );
}

export default Dashboard;
