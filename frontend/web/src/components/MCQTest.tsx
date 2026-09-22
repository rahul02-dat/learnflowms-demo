import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { CheckCircle, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';

interface MCQTestProps {
  contentItemId: string;
  onPassed: () => void;
}

interface MCQData {
  id: string;
  question_text: string;
  options: string[];
}

export default function MCQTest({ contentItemId, onPassed }: MCQTestProps) {
  const [question, setQuestion] = useState<MCQData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const fetchRandomQuestion = async () => {
    setLoading(true);
    setError(null);
    setSelectedIndex(null);
    setResult(null);
    try {
      const response = await apiClient.get(`/content/${contentItemId}/mcq/random`);
      setQuestion(response.data.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No MCQs exist for this content. Pass immediately.
        onPassed();
      } else {
        setError("Failed to load question. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomQuestion();
  }, [contentItemId]);

  const handleSubmit = async () => {
    if (selectedIndex === null || !question) return;
    
    setVerifying(true);
    try {
      const response = await apiClient.post(`/content/mcq/${question.id}/verify`, {
        selected_index: selectedIndex
      });
      
      const isCorrect = response.data.data.correct;
      if (isCorrect) {
        setResult('correct');
        setTimeout(() => {
          onPassed();
        }, 1500);
      } else {
        setResult('incorrect');
        setTimeout(() => {
          // Fetch a new question after showing incorrect feedback for 2 seconds
          fetchRandomQuestion();
        }, 2000);
      }
    } catch (err) {
      setError("Failed to verify answer. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 border border-[#30363d] rounded-xl bg-[#161b22] flex items-center justify-center">
        <RefreshCw className="animate-spin text-[#8b949e]" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-[#f85149] rounded-xl bg-[#161b22] text-center">
        <AlertCircle className="mx-auto text-[#f85149] mb-2" size={24} />
        <p className="text-[#f85149]">{error}</p>
        <button 
          onClick={fetchRandomQuestion}
          className="mt-4 px-4 py-2 bg-[#30363d] text-white rounded-md hover:bg-[#8b949e] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="p-8 border border-[#30363d] rounded-xl bg-[#161b22] shadow-2xl animate-in fade-in slide-in-from-bottom-4">
      <h3 className="text-xl font-bold mb-6 text-[#e6edf3]" style={{ fontFamily: 'Fraunces, serif' }}>
        Knowledge Check
      </h3>
      
      <div className="mb-6">
        <p className="text-lg text-[#c9d1d9] mb-4 font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {question.question_text}
        </p>
        
        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!verifying && result !== 'correct') {
                  setSelectedIndex(idx);
                }
              }}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedIndex === idx 
                  ? 'border-[#58a6ff] bg-[#1f2428] text-[#e6edf3]' 
                  : 'border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#8b949e] hover:text-[#c9d1d9]'
              } ${verifying || result === 'correct' ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedIndex === idx ? 'border-[#58a6ff]' : 'border-[#484f58]'
                }`}>
                  {selectedIndex === idx && <div className="w-2.5 h-2.5 rounded-full bg-[#58a6ff]" />}
                </div>
                <span style={{ fontFamily: 'DM Sans, sans-serif' }}>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#30363d] pt-6 mt-6">
        <div>
          {result === 'correct' && (
            <div className="flex items-center gap-2 text-[#3fb950] animate-in fade-in">
              <CheckCircle size={20} />
              <span className="font-semibold">Correct! Moving to next section...</span>
            </div>
          )}
          {result === 'incorrect' && (
            <div className="flex items-center gap-2 text-[#f85149] animate-in fade-in">
              <AlertCircle size={20} />
              <span className="font-semibold">Incorrect. Try a different question!</span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={selectedIndex === null || verifying || result === 'correct'}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-semibold transition-colors ${
            selectedIndex === null || verifying || result === 'correct'
              ? 'bg-[#21262d] text-[#484f58] cursor-not-allowed'
              : 'bg-[#238636] hover:bg-[#2ea043] text-white'
          }`}
        >
          {verifying ? 'Checking...' : 'Submit'} 
          {!verifying && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  );
}
