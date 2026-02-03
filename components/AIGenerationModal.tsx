
import React, { useState } from 'react';
import { generateRoadmapWithAI } from '../services/geminiService';
import type { Roadmap } from '../types';
import { SparklesIcon, XIcon } from './icons/Icons';

interface AIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoadmapGenerated: (roadmap: Partial<Roadmap>) => void;
}

export const AIGenerationModal: React.FC<AIGenerationModalProps> = ({ isOpen, onClose, onRoadmapGenerated }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setTopic('');
    setError(null);
    setIsLoading(false);
    onClose();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateRoadmapWithAI(topic);
      if (result) {
        try {
          // This call can throw an error if the user hits their plan limit
          onRoadmapGenerated(result);
          handleClose();
        } catch (addError) {
          setError(addError instanceof Error ? addError.message : 'Could not add the generated roadmap.');
        }
      } else {
        setError('The AI could not generate a roadmap for this topic. Please try another one.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up">
        <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <XIcon />
        </button>
        <div className="p-8">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Generate Roadmap with AI</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Describe the skill you want to learn or the project you want to build.</p>

          <form onSubmit={handleSubmit} className="mt-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-foreground mb-1">Topic</label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'Learn Python for Data Science'"
                className="w-full bg-input border border-border rounded-md py-2 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>
            
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : 'Generate Roadmap'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
