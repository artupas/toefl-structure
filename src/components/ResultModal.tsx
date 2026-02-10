'use client';

interface ResultModalProps {
  isOpen: boolean;
  score: number;
  totalQuestions: number;
  correctCount: number;
  onClose: () => void;
  onRestart: () => void;
}

export default function ResultModal({
  isOpen,
  score,
  totalQuestions,
  correctCount,
  onClose,
  onRestart
}: ResultModalProps) {
  if (!isOpen) return null;

  const getScoreMessage = () => {
    if (score >= 80) return { message: 'Excellent!', color: 'text-green-600' };
    if (score >= 60) return { message: 'Good Job!', color: 'text-blue-600' };
    if (score >= 40) return { message: 'Keep Practicing!', color: 'text-yellow-600' };
    return { message: 'Need More Practice', color: 'text-red-600' };
  };

  const { message, color } = getScoreMessage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center">
          <h2 className={`text-3xl font-bold mb-2 ${color}`}>
            {message}
          </h2>
          
          <div className="my-8">
            <div className="text-6xl font-bold text-gray-800 mb-2">
              {score}%
            </div>
            <p className="text-gray-600">
              {correctCount} out of {totalQuestions} correct
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={onRestart}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Review Answers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
