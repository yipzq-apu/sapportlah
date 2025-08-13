'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface Question {
  id: string;
  question: string;
  answer: string | null;
  askerName: string;
  dateAsked: string;
  dateAnswered: string | null;
  anonymous: boolean;
}

export default function CampaignQnAPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [answerText, setAnswerText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
          const user = JSON.parse(userData);
          setUser(user);
        }

        // Mock Q&A data
        const mockQuestions: Question[] = [
          {
            id: '1',
            question:
              'How will you ensure the water purification systems are maintained long-term?',
            answer:
              "We will train local technicians and establish a maintenance fund that covers repairs and replacements for the first 5 years. Additionally, we're partnering with the local government to ensure ongoing support.",
            askerName: 'David Kim',
            dateAsked: '2024-04-18T14:30:00Z',
            dateAnswered: '2024-04-19T09:15:00Z',
            anonymous: false,
          },
          {
            id: '2',
            question: "What happens if you don't reach the full funding goal?",
            answer:
              "Since this is an all-or-nothing campaign, if we don't reach our goal, all funds will be returned to donors. However, we have backup plans to seek additional funding from grants and corporate sponsors.",
            askerName: 'Anonymous',
            dateAsked: '2024-04-17T11:20:00Z',
            dateAnswered: '2024-04-17T16:45:00Z',
            anonymous: true,
          },
          {
            id: '3',
            question:
              'Can you provide more details about the solar technology being used?',
            answer: null,
            askerName: 'Emily Zhang',
            dateAsked: '2024-04-20T08:30:00Z',
            dateAnswered: null,
            anonymous: false,
          },
          {
            id: '4',
            question:
              'How will you measure the success and impact of this project?',
            answer: null,
            askerName: 'Anonymous',
            dateAsked: '2024-04-21T13:45:00Z',
            dateAnswered: null,
            anonymous: true,
          },
        ];

        setQuestions(mockQuestions);
      } catch (error) {
        console.error('Error fetching Q&A:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAnswerSubmit = async (questionId: string) => {
    const answer = answerText[questionId];
    if (!answer?.trim()) return;

    try {
      // Handle answer submission
      console.log('Submitting answer:', { questionId, answer });

      // Update local state
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, answer, dateAnswered: new Date().toISOString() }
            : q
        )
      );

      // Clear answer text
      setAnswerText((prev) => ({ ...prev, [questionId]: '' }));

      alert('Answer submitted successfully!');
    } catch (error) {
      alert('Failed to submit answer. Please try again.');
    }
  };

  const filteredQuestions = questions.filter((question) => {
    if (filter === 'answered') return question.answer !== null;
    if (filter === 'unanswered') return question.answer === null;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading Q&A...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/my-campaigns" className="hover:text-blue-600">
                My Campaigns
              </Link>
            </li>
            <li>›</li>
            <li>
              <Link
                href={`/my-campaigns/${campaignId}`}
                className="hover:text-blue-600"
              >
                Campaign Details
              </Link>
            </li>
            <li>›</li>
            <li className="text-gray-900">Q&A</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Q&A Management
          </h1>
          <p className="text-lg text-gray-600">
            Respond to questions from your supporters and potential donors.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Questions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {questions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Answered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {questions.filter((q) => q.answer).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {questions.filter((q) => !q.answer).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Questions' },
                { key: 'unanswered', label: 'Unanswered' },
                { key: 'answered', label: 'Answered' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              {/* Question */}
              <div className="mb-4">
                <div className="flex items-start mb-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold text-sm">
                      Q
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">
                      {question.question}
                    </p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span>
                        Asked by{' '}
                        {question.anonymous ? 'Anonymous' : question.askerName}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(question.dateAsked)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Answer */}
              {question.answer ? (
                <div className="ml-11 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-semibold text-sm">
                        A
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700">{question.answer}</p>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <span>Answered by you</span>
                        <span className="mx-2">•</span>
                        <span>
                          {question.dateAnswered &&
                            formatDate(question.dateAnswered)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ml-11">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                    <p className="text-sm text-yellow-800 mb-3">
                      <span className="font-medium">Pending:</span> This
                      question needs your response.
                    </p>
                    <textarea
                      value={answerText[question.id] || ''}
                      onChange={(e) =>
                        setAnswerText((prev) => ({
                          ...prev,
                          [question.id]: e.target.value,
                        }))
                      }
                      placeholder="Type your answer here..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleAnswerSubmit(question.id)}
                        disabled={!answerText[question.id]?.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition duration-300"
                      >
                        Submit Answer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">❓</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No questions found
              </h3>
              <p className="text-gray-600">
                {filter === 'all'
                  ? 'No one has asked questions about your campaign yet.'
                  : `No ${filter} questions found.`}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
