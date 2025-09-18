import { useState, useEffect } from 'react';
import apiClient from '../api';
import './ReviewSession.css';

function ReviewSession({ onFinishSession }) {
  const [currentWord, setCurrentWord] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionComplete, setSessionComplete] = useState(false);

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

  useEffect(() => {
    fetchNextWord();
  }, []);

  const handleSubmitReview = async (was_correct) => {
    if (!currentWord) return;

    try {
      await apiClient.post(`/review/${currentWord.id}`, { was_correct });
      // After submitting, immediately fetch the next word for a seamless experience
      fetchNextWord();
    } catch (err) {
      setError('Could not submit review. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="review-container"><p>Loading review session...</p></div>;
  }

  if (sessionComplete) {
    return (
      <div className="review-container">
        <div className="completion-card">
          <h2>Congratulations!</h2>
          <p>You've completed all your reviews for today.</p>
          <button onClick={onFinishSession} className="finish-btn">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (error) {
     return <div className="review-container"><p className="error-message">{error}</p></div>
  }

  return (
    <div className="review-container">
      <div className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}>
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <h2 className="word-text">{currentWord?.text}</h2>
          </div>
          <div className="flashcard-back">
            <p className="word-definition">{currentWord?.definition}</p>
          </div>
        </div>
      </div>

      <div className="controls">
        {!isFlipped ? (
          <button onClick={() => setIsFlipped(true)} className="control-btn reveal-btn">
            Show Definition
          </button>
        ) : (
          <div className="feedback-buttons">
            <button onClick={() => handleSubmitReview(false)} className="control-btn incorrect-btn">
              I Forgot
            </button>
            <button onClick={() => handleSubmitReview(true)} className="control-btn correct-btn">
              I Knew It
            </button>
          </div>
        )}
      </div>
       <button onClick={onFinishSession} className="end-session-btn">End Session</button>
    </div>
  );
}

export default ReviewSession;
