import { useState, useEffect } from 'react';
import apiClient from '../api';
import './AddWordModal.css';

// Accept a new prop: initialWord
function AddWordModal({ onClose, onWordAdded, initialWord = '' }) {
  const [step, setStep] = useState(1);
  // Pre-fill the wordText state if an initialWord is provided
  const [wordText, setWordText] = useState(initialWord);
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState('');

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

  // Use useEffect to automatically explain the word if it's provided on mount
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
      // Update the explanation with the new details, keeping the original definition
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
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="close-btn">&times;</button>
        {step === 1 && (
          <>
            <h2>Add a New Word</h2>
            <p>Enter a word to get its definition, an example, and a mnemonic.</p>
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
                placeholder="e.g., auspicious"
                autoFocus
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Thinking...' : 'Explain Word'}
              </button>
            </form>
          </>
        )}
        {step === 2 && explanation && (
          <div className="explanation-view">
            <h2>{wordText}</h2>
            <div className="explanation-item">
              <strong>Definition:</strong>
              <p>{explanation.definition}</p>
            </div>
            <div className="explanation-item">
              <strong>Example:</strong>
              <p><em>{explanation.example}</em></p>
            </div>
            <div className="explanation-item">
              <strong>Mnemonic:</strong>
              <p>{explanation.mnemonic}</p>
            </div>

            <div className="modal-actions">
                <button onClick={handleRegenerate} disabled={isRegenerating} className="regenerate-btn">
                    {isRegenerating ? 'Getting new example...' : 'Try Another Example'}
                </button>
                <button onClick={handleAddWord} disabled={isLoading} className="confirm-btn">
                    {isLoading ? 'Saving...' : 'Got It, Add to My Vocabulary'}
                </button>
            </div>
          </div>
        )}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default AddWordModal;

