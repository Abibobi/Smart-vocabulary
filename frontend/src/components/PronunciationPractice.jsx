import { useState, useEffect } from 'react';
import { Mic, Volume2 } from 'lucide-react'; // Import the new speaker icon

// Check for browser support for both APIs
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
const synth = window.speechSynthesis;

if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

function PronunciationPractice({ word }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleListen = () => {
    if (!synth || isSpeaking) return;

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setFeedback("Sorry, couldn't play the audio.");
      setIsSpeaking(false);
    };
    synth.speak(utterance);
  };

  const handleRecord = () => {
    if (!recognition || isRecording) {
        if (!recognition) setFeedback("Sorry, your browser doesn't support speech recognition.");
        return;
    }
    
    setFeedback('');
    setIsRecording(true);
    recognition.start();
  };

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.toLowerCase().trim();
      if (spokenText === word.toLowerCase()) {
        setFeedback('Correct! Great job!');
      } else {
        setFeedback(`We heard: "${spokenText}". Try again!`);
      }
    };

    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event) => {
      setFeedback(`Error in recognition: ${event.error}`);
      setIsRecording(false);
    };

    return () => {
      if (recognition) recognition.stop();
      if (synth) synth.cancel();
    };
  }, [word]);
  
  const feedbackClasses = `font-bold ${feedback.startsWith('Correct') ? 'text-green-600' : 'text-red-600'}`;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
      <h4 className="mt-0 mb-4 text-gray-600 font-semibold">Listen & Practice</h4>
      <div className="flex justify-center items-center space-x-4">
        {/* --- NEW LISTEN BUTTON --- */}
        <button
          onClick={handleListen}
          disabled={isSpeaking || isRecording}
          className="w-16 h-16 rounded-full flex justify-center items-center cursor-pointer transition-all duration-200 bg-blue-100 border-2 border-blue-300 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Listen to pronunciation"
        >
          <Volume2 className={`transition-transform duration-200 ${isSpeaking ? 'scale-110' : ''} text-blue-600`} size={28} />
        </button>

        {/* --- EXISTING RECORD BUTTON --- */}
        <button
          onClick={handleRecord}
          disabled={isSpeaking || isRecording}
          className={`w-16 h-16 rounded-full flex justify-center items-center cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording 
              ? 'bg-red-500 border-red-500 animate-pulse' 
              : 'bg-gray-100 border-2 border-gray-300 hover:bg-gray-200'
          }`}
          aria-label="Start recording pronunciation"
        >
          <Mic className={isRecording ? 'text-white' : 'text-gray-600'} size={28} />
        </button>
      </div>

      <div className="mt-4 min-h-[24px]">
        {feedback && <p className={feedbackClasses}>{feedback}</p>}
      </div>
    </div>
  );
}

export default PronunciationPractice;

