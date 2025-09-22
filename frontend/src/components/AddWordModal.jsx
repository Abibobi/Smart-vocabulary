import { useState, useEffect } from 'react';
import { X, BookOpen, Sparkles, RefreshCw, Plus, Lightbulb, FileText, Quote } from 'lucide-react';
import apiClient from '../api';
import PronunciationPractice from './PronunciationPractice'; // Import the component

function AddWordModal({ onClose, onWordAdded, initialWord = '' }) {
  // Your original working state management
  const [step, setStep] = useState(1);
  const [wordText, setWordText] = useState(initialWord);
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState('');

  // All your original functions (handleExplainWord, useEffect, etc.) remain unchanged
  const handleExplainWord = async (wordToExplain) => {
    if (!wordToExplain.trim()) return;
    
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/ai/explain-word/', { word_text: wordToExplain });
      setExplanation(response.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not explain the word.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialWord) {
      handleExplainWord(initialWord);
    }
  }, [initialWord]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleExplainWord(wordText);
  };
  
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError('');
    try {
      const response = await apiClient.post('/ai/regenerate-explanation/', {
        word_text: wordText,
        previous_example: explanation.example,
        previous_mnemonic: explanation.mnemonic
      });
      setExplanation(prev => ({ ...prev, ...response.data }));
    } catch (err) {
      setError('Could not get a new example.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAddWord = async () => {
    setIsLoading(true);
    setError('');
    try {
      await apiClient.post('/words/', {
        text: wordText,
        definition: explanation.definition,
      });
      onWordAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save the word.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="rounded-2xl bg-white/20 p-3">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {step === 1 ? 'Add a New Word' : `Understanding "${wordText}"`}
                </h2>
                <p className="text-blue-100">
                  {step === 1 
                    ? 'Enter a word to get its definition, an example, and a mnemonic.' 
                    : 'AI-powered word explanation'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 1 && (
              // ... Your step 1 JSX is perfect, no changes needed ...
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <Sparkles className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-gray-600">
                    Enter any word to get an instant AI-powered explanation with examples and memory techniques
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Word to explain
                    </label>
                    <input
                      type="text"
                      value={wordText}
                      onChange={(e) => setWordText(e.target.value)}
                      placeholder="e.g., auspicious"
                      autoFocus
                      className="w-full rounded-2xl border border-gray-200 px-4 py-4 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>Explain Word</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {step === 2 && explanation && (
              <div className="space-y-6">
                {/* Word Title */}
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-gray-900 capitalize mb-2">
                    {wordText}
                  </h3>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto" />
                </div>

                {/* Explanation Cards */}
                <div className="space-y-4">
                  {/* Definition */}
                  <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="rounded-xl bg-blue-100 p-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Definition</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{explanation.definition}</p>
                  </div>

                  {/* Example */}
                  <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="rounded-xl bg-green-100 p-2">
                        <Quote className="h-5 w-5 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Example</h4>
                    </div>
                    <p className="text-gray-700 italic leading-relaxed">"{explanation.example}"</p>
                  </div>

                  {/* Mnemonic */}
                  <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="rounded-xl bg-purple-100 p-2">
                        <Lightbulb className="h-5 w-5 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Mnemonic</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{explanation.mnemonic}</p>
                  </div>
                </div>
                
                {/* --- INTEGRATION POINT --- */}
                {/* The PronunciationPractice component is added here */}
                <PronunciationPractice word={wordText} />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="flex-1 rounded-2xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className={`h-5 w-5 ${isRegenerating ? 'animate-spin' : ''}`} />
                    <span>{isRegenerating ? 'Getting new example...' : 'Try Another Example'}</span>
                  </button>
                  
                  <button
                    onClick={handleAddWord}
                    disabled={isLoading}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        <span>Got It, Add to My Vocabulary</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Your original error handling */}
            {error && (
              <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4">
                <div className="flex items-center space-x-2">
                  <div className="rounded-full bg-red-100 p-1">
                    <X className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddWordModal;

