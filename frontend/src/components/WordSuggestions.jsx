import { Lightbulb, Sparkles, ArrowRight, BookOpen, Clock, TrendingUp } from 'lucide-react';

function WordSuggestions({ suggestions, onSelectWord, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full"></div>
          <div className="text-blue-600 font-medium">Getting personalized suggestions...</div>
        </div>
        
        {/* Loading skeleton */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-blue-200 h-12 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  // Categorize suggestions by difficulty/type (mock logic - you can enhance this)
  const categorizedSuggestions = suggestions.reduce((acc, word, index) => {
    const categories = ['beginner', 'intermediate', 'advanced'];
    const icons = [BookOpen, TrendingUp, Sparkles];
    const colors = ['green', 'blue', 'purple'];
    
    const category = categories[index % 3];
    const icon = icons[index % 3];
    const color = colors[index % 3];
    
    if (!acc[category]) {
      acc[category] = { words: [], icon, color };
    }
    acc[category].words.push(word);
    return acc;
  }, {});

  return (
    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-3xl p-6 border border-amber-100 shadow-lg">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Smart Suggestions</h3>
          <p className="text-amber-700 text-sm">Curated words to expand your vocabulary</p>
        </div>
      </div>

      {/* Quick suggestions grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {suggestions.map((word, index) => (
          <button 
            key={index} 
            className="group relative bg-white hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 text-gray-800 hover:text-white font-medium py-3 px-4 rounded-xl shadow-sm hover:shadow-lg border border-amber-200 hover:border-transparent transition-all duration-300 transform hover:scale-105"
            onClick={() => onSelectWord(word)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold capitalize truncate">{word}</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>

      {/* Categorized suggestions */}
      {Object.entries(categorizedSuggestions).length > 1 && (
        <div className="space-y-4">
          <div className="border-t border-amber-200 pt-4">
            <h4 className="text-sm font-medium text-amber-800 mb-3">Organized by difficulty:</h4>
          </div>
          
          {Object.entries(categorizedSuggestions).map(([category, { words, icon: Icon, color }]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 text-${color}-600`} />
                </div>
                <span className={`text-sm font-medium text-${color}-700 capitalize`}>
                  {category} Level
                </span>
                <span className={`text-xs text-${color}-500`}>
                  ({words.length} {words.length === 1 ? 'word' : 'words'})
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 ml-8">
                {words.map((word, wordIndex) => (
                  <button
                    key={wordIndex}
                    onClick={() => onSelectWord(word)}
                    className={`text-xs px-3 py-1.5 bg-${color}-100 hover:bg-${color}-200 text-${color}-700 hover:text-${color}-800 rounded-full font-medium transition-colors duration-200 capitalize`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to action */}
      <div className="mt-6 pt-4 border-t border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-700">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Click any word to get started</span>
          </div>
          <div className="text-xs text-amber-600 bg-amber-100 px-3 py-1 rounded-full font-medium">
            {suggestions.length} suggestions
          </div>
        </div>
      </div>
    </div>
  );
}

export default WordSuggestions;
