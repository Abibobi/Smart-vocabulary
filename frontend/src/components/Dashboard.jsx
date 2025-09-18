import { useState, useEffect } from 'react';
import apiClient from '../api';
import ReviewSession from './ReviewSession';
import AddWordModal from './AddWordModal';
import WordSuggestions from './WordSuggestions';
import './Dashboard.css';

function Dashboard({ setToken }) {
  const [words, setWords] = useState([]);
  const [error, setError] = useState('');
  
  const [isReviewing, setIsReviewing] = useState(false);
  const [isAddingWord, setIsAddingWord] = useState(false);
  // This state will hold a word clicked from the suggestions
  const [wordToExplain, setWordToExplain] = useState('');

  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const fetchWords = async () => {
    try {
      const response = await apiClient.get('/words/');
      setWords(response.data);
    } catch (err) {
      setError('Could not fetch words.');
    }
  };

  useEffect(() => {
    if (!isReviewing) {
      fetchWords();
    }
  }, [isReviewing]);

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

  // When a suggested word is clicked, set it in state and open the modal
  const handleSuggestionClick = (word) => {
    setWordToExplain(word);
    setIsAddingWord(true);
  };
  
  const handleAddNewWordClick = () => {
    setWordToExplain(''); // Ensure no initial word is passed
    setIsAddingWord(true);
  };

  if (isReviewing) {
    return <ReviewSession onFinishSession={() => setIsReviewing(false)} />;
  }

  return (
    <>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>My Vocabulary</h1>
          <div className="header-buttons">
            <button onClick={handleAddNewWordClick} className="add-word-btn">
              + Add New Word
            </button>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </header>

        <div className="review-prompt">
          <h2>Ready to learn?</h2>
          <p>You have words due for review. Start a session to continue learning.</p>
          <button onClick={() => setIsReviewing(true)} className="start-review-btn">
            Start Review Session
          </button>
        </div>

        <div className="word-list-section">
          <h2>My Word List</h2>
          {words.length > 0 ? (
            <ul className="word-list">
              {words.map((word) => (
                <li key={word.id} className="word-item">
                  <span className="word-text">{word.text}</span>
                  <p className="word-definition">{word.definition}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Your vocabulary list is empty. Add a new word or get some suggestions below!</p>
          )}
        </div>
        
        <div className="suggestions-section">
          <h2>Need Inspiration?</h2>
          <p>Let our AI suggest some new words for you to learn.</p>
          <button onClick={handleGetSuggestions} disabled={isLoadingSuggestions} className="suggest-btn">
            {isLoadingSuggestions ? 'Thinking...' : 'Suggest Words for Me'}
          </button>
          <WordSuggestions 
            suggestions={suggestions} 
            onSelectWord={handleSuggestionClick} 
            isLoading={isLoadingSuggestions}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
      
      {isAddingWord && (
        <AddWordModal 
          // Pass the selected word (or an empty string) to the modal
          initialWord={wordToExplain}
          onClose={() => setIsAddingWord(false)} 
          // After adding a word, refresh the list and clear suggestions
          onWordAdded={() => { fetchWords(); setSuggestions([]); }}
        />
      )}
    </>
  );
}

export default Dashboard;

