import { useState, useEffect } from 'react';
import { Eye, Check, X, Trophy, RotateCcw, Home, Sparkles, Brain, Clock } from 'lucide-react';
import apiClient from '../api';

function ReviewSession({ onFinishSession }) {
  // Your original working state management
  const [currentWord, setCurrentWord] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionComplete, setSessionComplete] = useState(false);
  
  // Additional state for modern UI stats
  const [reviewCount, setReviewCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Your original working fetchNextWord function
  const fetchNextWord = async () => {
    setIsLoading(true);
    setError('');
    setIsFlipped(false);
    try {
      const response = await apiClient.get('/review/next/');
      setCurrentWord(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setSessionComplete(true);
        setCurrentWord(null);
      } else {
        setError('Failed to fetch the next word. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Your original useEffect
  useEffect(() => {
    fetchNextWord();
  }, []);

  // Your original handleSubmitReview function with stats tracking
  const handleSubmitReview = async (was_correct) => {
    if (!currentWord) return;

    try {
      await apiClient.post(`/review/${currentWord.id}`, { was_correct });
      
      // Update stats for modern UI
      setReviewCount(prev => prev + 1);
      if (was_correct) {
        setCorrectCount(prev => prev + 1);
      }
      
      // After submitting, immediately fetch the next word for a seamless experience
      fetchNextWord();
    } catch (err) {
      setError('Could not submit review. Please try again.');
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center">
          <div className="mb-6">
            <div className="animate-spin mx-auto w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading review session...</h3>
          <p className="text-gray-600">Preparing your personalized word session...</p>
        </div>
      </div>
    );
  }

  // Completion State
  if (sessionComplete) {
    const accuracy = reviewCount > 0 ? Math.round((correctCount / reviewCount) * 100) : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-lg w-full text-center">
          {/* Success Header */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h2>
            <p className="text-gray-600 text-lg">You've completed all your reviews for today.</p>
          </div>

          {/* Stats */}
          {reviewCount > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">{reviewCount}</div>
                <div className="text-sm text-blue-700 font-medium">Words Reviewed</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">{accuracy}%</div>
                <div className="text-sm text-green-700 font-medium">Accuracy</div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onFinishSession}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={fetchNextWord}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry</span>
            </button>
            <button
              onClick={onFinishSession}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Review Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Review Session</h1>
              <p className="text-gray-600">Test your vocabulary knowledge</p>
            </div>
          </div>
          
          {/* Stats Badge */}
          {reviewCount > 0 && (
            <div className="bg-white rounded-2xl px-4 py-2 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">{reviewCount}</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-green-600">{correctCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <div 
            className={`relative w-full h-80 perspective-1000 cursor-pointer transition-transform duration-500 ${
              isFlipped ? 'transform-style-preserve-3d rotate-y-180' : ''
            }`}
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            {/* Front Side */}
            <div className={`absolute inset-0 w-full h-full backface-hidden ${
              isFlipped ? 'rotate-y-180' : ''
            }`}>
              <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-2xl flex items-center justify-center text-white">
                <div className="text-center px-8">
                  <div className="mb-4">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  </div>
                  <h2 className="text-4xl font-bold mb-4 capitalize break-words">
                    {currentWord?.text}
                  </h2>
                  <p className="text-indigo-200 text-lg">
                    {!isFlipped && "Tap to reveal definition"}
                  </p>
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 ${
              !isFlipped ? 'rotate-y-180' : ''
            }`}>
              <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl flex items-center justify-center text-white">
                <div className="text-center px-8">
                  <div className="mb-4">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 capitalize">
                    {currentWord?.text}
                  </h3>
                  <p className="text-lg leading-relaxed text-emerald-50">
                    {currentWord?.definition}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {!isFlipped ? (
            <button
              onClick={() => setIsFlipped(true)}
              className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Show Definition</span>
            </button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleSubmitReview(false)}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 group"
              >
                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>I Forgot</span>
              </button>
              <button
                onClick={() => handleSubmitReview(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 group"
              >
                <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>I Knew It</span>
              </button>
            </div>
          )}
        </div>

        {/* End Session Button */}
        <div className="mt-8 text-center">
          <button
            onClick={onFinishSession}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Custom CSS for 3D flip effect */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}

export default ReviewSession;
