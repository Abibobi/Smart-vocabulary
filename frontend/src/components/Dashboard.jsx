import { useState, useEffect } from 'react';
import apiClient from '../api';
import ReviewSession from './ReviewSession';
import './Dashboard.css';

function Dashboard({ setToken }) {
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State to control which view is active
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchWords = async () => {
    try {
      const response = await apiClient.get('/words/');
      setWords(response.data);
    } catch (err) {
      setError('Could not fetch words.');
    }
  };

  useEffect(() => {
    // Only fetch words when not in a review session
    if (!isReviewing) {
      fetchWords();
    }
  }, [isReviewing]);

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      await apiClient.post('/words/', { text: newWord });
      setNewWord('');
      await fetchWords();
    } catch (err) { // <<< THIS BLOCK IS NOW FIXED
      setError(err.response?.data?.detail || 'Failed to add word.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
  };
  
  // If user is in a review session, show the ReviewSession component
  if (isReviewing) {
    return <ReviewSession onFinishSession={() => setIsReviewing(false)} />;
  }

  // Otherwise, show the main dashboard
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>My Vocabulary</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="review-prompt">
        <h2>Ready to learn?</h2>
        <p>Start a session to continue learning and master your vocabulary.</p>
        <button onClick={() => setIsReviewing(true)} className="start-review-btn">
          Start Review Session
        </button>
      </div>

      <div className="dashboard-content">
        <div className="add-word-section">
          <h2>Add a New Word</h2>
          <form onSubmit={handleAddWord}>
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="e.g., serendipity"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Word'}
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="word-list-section">
          <h2>Word List</h2>
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
            <p>Your vocabulary list is empty. Add a new word to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

