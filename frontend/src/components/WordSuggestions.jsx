import './WordSuggestions.css';

function WordSuggestions({ suggestions, onSelectWord, isLoading }) {
  if (isLoading) {
    return <div className="loading-suggestions">Getting suggestions...</div>;
  }

  if (!suggestions || suggestions.length === 0) {
    return null; // Don't render anything if there are no suggestions yet
  }

  return (
    <div className="suggestions-container">
      <h3>Here are some suggestions to get you started:</h3>
      <div className="suggestions-list">
        {suggestions.map((word, index) => (
          <button 
            key={index} 
            className="suggestion-item"
            onClick={() => onSelectWord(word)}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}

export default WordSuggestions;