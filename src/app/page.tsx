'use client';

import { useState, useEffect } from 'react';
import Timer from '@/components/Timer';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';
import ResultModal from '@/components/ResultModal';

interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  category?: string;
}

interface AnswerResult {
  questionId: number;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string | null;
}

interface TestResult {
  sessionId?: number;
  score: number;
  totalQuestions: number;
  correctCount: number;
  results: AnswerResult[];
}

interface TestSession {
  id: number;
  user_name: string | null;
  started_at: string;
  ended_at: string;
  score: number;
  total_questions: number;
  correct_answers: number;
}

interface CategoryStat {
  name: string;
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

interface TestAnalysis {
  session: TestSession;
  answers: Array<{
    id: number;
    question_id: number;
    selected_answer: string;
    is_correct: number;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
    explanation: string;
    category: string;
  }>;
  categoryAnalysis: CategoryStat[];
  recommendations: string[];
}

const TEST_DURATION = 20;

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [testHistory, setTestHistory] = useState<TestSession[]>([]);
  const [userName, setUserName] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<TestAnalysis | null>(null);

  useEffect(() => {
    fetchQuestions();
    fetchTestHistory();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchTestHistory = async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      if (data.success) {
        setTestHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching test history:', error);
    }
  };

  const fetchAnalysis = async (sid: number) => {
    try {
      const response = await fetch(`/api/sessions/${sid}/analysis`);
      const data = await response.json();
      if (data.success) {
        setAnalysis(data.data);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  const startTest = async () => {
    // Create a new session
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: userName || null })
      });
      const data = await response.json();
      if (data.success) {
        setSessionId(data.data.sessionId);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }

    setIsTestActive(true);
    setIsTestFinished(false);
    setShowResults(false);
    setTestResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowReview(false);
    setShowHistory(false);
    setShowAnalysis(false);
    setAnalysis(null);
  };

  const handleSelectAnswer = (answer: string) => {
    if (!isTestActive || isTestFinished) return;
    
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    const answersArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId: parseInt(questionId),
      selectedAnswer
    }));

    try {
      const response = await fetch('/api/questions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers: answersArray,
          sessionId,
          userName
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult(data.data);
        setIsTestFinished(true);
        setIsTestActive(false);
        setShowResults(true);
        // Fetch analysis after submission
        if (data.data.sessionId) {
          fetchAnalysis(data.data.sessionId);
        }
        // Refresh test history
        fetchTestHistory();
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  const handleRestart = () => {
    setShowResults(false);
    setShowReview(false);
    setShowAnalysis(false);
    fetchQuestions(); // This will get new random 10 questions
    startTest();
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setShowReview(true);
  };

  const handleBackToHome = () => {
    setShowReview(false);
    setShowAnalysis(false);
    setIsTestFinished(false);
    setIsTestActive(false);
    setShowResults(false);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Analysis View
  if (showAnalysis && analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-800">📊 Grammar Analysis</h1>
              <div className="flex gap-3">
                <button
                  onClick={handleBackToHome}
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back to Home
                </button>
                <button
                  onClick={handleRestart}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>

          {/* Score Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Overall Score</p>
              <p className={`text-6xl font-bold ${
                analysis.session.score >= 70 ? 'text-green-600' : 
                analysis.session.score >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {analysis.session.score}%
              </p>
              <p className="text-gray-600 mt-2">
                {analysis.session.correct_answers}/{analysis.session.total_questions} correct
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance by Category</h2>
            <div className="space-y-4">
              {analysis.categoryAnalysis.map((cat) => (
                <div key={cat.name} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                    <span className={`font-bold ${
                      cat.accuracy >= 70 ? 'text-green-600' : 
                      cat.accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {cat.accuracy}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className={`h-3 rounded-full ${
                        cat.accuracy >= 70 ? 'bg-green-500' : 
                        cat.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${cat.accuracy}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{cat.correct} correct</span>
                    <span>{cat.incorrect} incorrect</span>
                    <span>{cat.total} total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 Study Recommendations</h2>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-gray-800">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Questions by Category */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Questions Review</h2>
            <div className="space-y-6">
              {analysis.answers.map((answer, index) => (
                <div key={answer.id} className={`border-2 rounded-lg p-4 ${
                  answer.is_correct ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Question {index + 1} • {answer.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      answer.is_correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {answer.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <p className="font-medium text-gray-800 mb-3">{answer.question}</p>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className={answer.selected_answer === 'A' ? (answer.correct_answer === 'A' ? 'text-green-700 font-medium' : 'text-red-700 font-medium') : (answer.correct_answer === 'A' ? 'text-green-600' : 'text-gray-600')}>
                      A. {answer.option_a}
                    </div>
                    <div className={answer.selected_answer === 'B' ? (answer.correct_answer === 'B' ? 'text-green-700 font-medium' : 'text-red-700 font-medium') : (answer.correct_answer === 'B' ? 'text-green-600' : 'text-gray-600')}>
                      B. {answer.option_b}
                    </div>
                    <div className={answer.selected_answer === 'C' ? (answer.correct_answer === 'C' ? 'text-green-700 font-medium' : 'text-red-700 font-medium') : (answer.correct_answer === 'C' ? 'text-green-600' : 'text-gray-600')}>
                      C. {answer.option_c}
                    </div>
                    <div className={answer.selected_answer === 'D' ? (answer.correct_answer === 'D' ? 'text-green-700 font-medium' : 'text-red-700 font-medium') : (answer.correct_answer === 'D' ? 'text-green-600' : 'text-gray-600')}>
                      D. {answer.option_d}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Your answer:</span> {answer.selected_answer} • 
                    <span className="font-medium"> Correct:</span> {answer.correct_answer}
                  </p>
                  <p className="text-sm text-blue-700 mt-2 bg-blue-50 p-2 rounded">
                    <span className="font-medium">Explanation:</span> {answer.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // History View
  if (showHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Test History</h1>
              <button
                onClick={() => setShowHistory(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
            </div>

            {testHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl">No test history yet</p>
                <p className="mt-2">Take a test to see your results here!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {testHistory.map((session) => (
                  <div
                    key={session.id}
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">
                          {formatDate(session.ended_at)}
                        </p>
                        <p className="font-medium text-gray-800 mt-1">
                          {session.user_name || 'Anonymous'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-3xl font-bold ${
                          session.score >= 70 ? 'text-green-600' : 
                          session.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {session.score}%
                        </p>
                        <p className="text-sm text-gray-600">
                          {session.correct_answers}/{session.total_questions} correct
                        </p>
                        <button
                          onClick={() => {
                            fetchAnalysis(session.id);
                            setShowAnalysis(true);
                            setShowHistory(false);
                          }}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Analysis →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (!isTestActive && !isTestFinished && !showReview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">📚</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              TOEFL Structure Test
            </h1>
            <p className="text-gray-600 text-lg">
              Test your English grammar and structure skills
            </p>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter your name (optional)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{questions.length || 10}</p>
              <p className="text-sm text-gray-600">Questions</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{TEST_DURATION}</p>
              <p className="text-sm text-gray-600">Minutes</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">110</p>
              <p className="text-sm text-gray-600">Question Bank</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Each test randomly selects 10 questions from our question bank</li>
              <li>Read each question carefully</li>
              <li>Choose the best answer (A, B, C, or D)</li>
              <li>You can navigate between questions</li>
              <li>Submit your answers before time runs out</li>
              <li>Get detailed grammar analysis after each test</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={startTest}
              disabled={questions.length === 0}
              className="w-full bg-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {questions.length === 0 ? 'Loading Questions...' : 'Start Test'}
            </button>
            
            <button
              onClick={() => setShowHistory(true)}
              className="w-full bg-gray-100 text-gray-700 py-3 px-8 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors"
            >
              View Test History
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Review Screen
  if (showReview && testResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800">Answer Review</h1>
              <div className="flex gap-3">
                <button
                  onClick={handleBackToHome}
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back to Home
                </button>
                {analysis && (
                  <button
                    onClick={() => setShowAnalysis(true)}
                    className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Analysis
                  </button>
                )}
                <button
                  onClick={handleRestart}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again (New Questions)
                </button>
              </div>
            </div>
          </div>

          {questions.map((question, index) => {
            const result = testResult.results.find(r => r.questionId === question.id);
            return (
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={index + 1}
                totalQuestions={questions.length}
                selectedAnswer={answers[question.id] || null}
                onSelectAnswer={() => {}}
                showResult={true}
                isCorrect={result?.isCorrect || false}
                correctAnswer={result?.correctAnswer || ''}
                explanation={result?.explanation || null}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Test Screen
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">TOEFL Structure Test</h1>
            <Timer
              duration={TEST_DURATION}
              onTimeUp={handleTimeUp}
              isActive={isTestActive}
            />
          </div>
          
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={questions.length}
          />
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Answered: {answeredCount}/{questions.length}</span>
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
        </div>

        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={answers[currentQuestion.id] || null}
            onSelectAnswer={handleSelectAnswer}
          />
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-2 flex-wrap justify-center">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : answers[questions[index]?.id]
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>

      {testResult && (
        <ResultModal
          isOpen={showResults}
          score={testResult.score}
          totalQuestions={testResult.totalQuestions}
          correctCount={testResult.correctCount}
          onClose={handleCloseResults}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
