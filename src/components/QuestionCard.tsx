'use client';



interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  showResult?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string;
  explanation?: string | null;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showResult = false,
  isCorrect,
  correctAnswer,
  explanation
}: QuestionCardProps) {
  const options = [
    { key: 'A', label: question.option_a },
    { key: 'B', label: question.option_b },
    { key: 'C', label: question.option_c },
    { key: 'D', label: question.option_d }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4">
        <span className="text-sm text-gray-500 font-medium">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>
      
      <p className="text-lg font-medium text-gray-800 mb-6">
        {question.question}
      </p>
      
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.key;
          const isCorrectOption = option.key === correctAnswer;
          
          let buttonClass = 'w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ';
          
          if (showResult) {
            if (isCorrectOption) {
              buttonClass += 'border-green-500 bg-green-50 text-green-800';
            } else if (isSelected && !isCorrect) {
              buttonClass += 'border-red-500 bg-red-50 text-red-800';
            } else {
              buttonClass += 'border-gray-200 text-gray-600';
            }
          } else {
            if (isSelected) {
              buttonClass += 'border-blue-500 bg-blue-50 text-blue-800';
            } else {
              buttonClass += 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700';
            }
          }
          
          return (
            <button
              key={option.key}
              onClick={() => !showResult && onSelectAnswer(option.key)}
              disabled={showResult}
              className={buttonClass}
            >
              <div className="flex items-start gap-3">
                <span className="font-bold min-w-[24px]">{option.key}.</span>
                <span>{option.label}</span>
              </div>
            </button>
          );
        })}
      </div>
      
      {showResult && explanation && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-bold">Explanation: </span>
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
