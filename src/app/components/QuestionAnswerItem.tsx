'use client';

import { useState } from 'react';

interface Question {
  id: string;
  question: string;
  answer: string | null;
  askerName: string;
  dateAsked: string;
  dateAnswered: string | null;
  anonymous: boolean;
}

interface Campaign {
  creator_name: string;
}

interface QuestionAnswerItemProps {
  question: Question;
  campaign: Campaign;
  isCreator: boolean;
  onAnswerSubmit: (questionId: string, answer: string) => Promise<void>;
  formatDate: (date: string) => string;
}

export default function QuestionAnswerItem({
  question,
  campaign,
  isCreator,
  onAnswerSubmit,
  formatDate,
}: QuestionAnswerItemProps) {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    setSubmitting(true);
    try {
      await onAnswerSubmit(question.id, answerText);
      setAnswerText('');
      setShowAnswerForm(false);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      {/* Question */}
      <div className="mb-4">
        <div className="flex items-start mb-2">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-semibold text-sm">Q</span>
          </div>
          <div className="flex-1">
            <p className="text-gray-900 font-medium">{question.question}</p>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <span>
                Asked by{' '}
                {question.anonymous ? 'Anonymous User' : question.askerName}
              </span>
              <span className="mx-2">•</span>
              <span>{formatDate(question.dateAsked)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Answer */}
      {question.answer ? (
        <div className="ml-11">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 font-semibold text-sm">A</span>
            </div>
            <div className="flex-1">
              <p className="text-gray-700">{question.answer}</p>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <span>Answered by {campaign.creator_name}</span>
                <span className="mx-2">•</span>
                <span>
                  {question.dateAnswered && formatDate(question.dateAnswered)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="ml-11">
          {isCreator ? (
            <div className="space-y-3">
              {!showAnswerForm ? (
                <button
                  onClick={() => setShowAnswerForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-300"
                >
                  Answer This Question
                </button>
              ) : (
                <form onSubmit={handleSubmitAnswer} className="space-y-3">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={3}
                    placeholder="Type your answer here..."
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      type="submit"
                      disabled={submitting || !answerText.trim()}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Posting...' : 'Post Answer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAnswerForm(false);
                        setAnswerText('');
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Pending:</span> This question is
                waiting for an answer from the campaign creator.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
