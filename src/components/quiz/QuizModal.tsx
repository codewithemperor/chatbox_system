import { X } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  topicId: string;
  difficulty: number;
  questions: QuizQuestion[];
  _count: {
    questions: number;
  };
}

interface QuizResult {
  questionId: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizModalProps {
  isOpen: boolean;
  quiz: Quiz | null;
  currentQuestionIndex: number;
  userAnswers: number[];
  isQuizCompleted: boolean;
  quizResults: QuizResult[];
  onAnswerSelect: (answerIndex: number) => void;
  onNextQuestion: () => void;
  onClose: () => void;
}

export default function QuizModal({
  isOpen,
  quiz,
  currentQuestionIndex,
  userAnswers,
  isQuizCompleted,
  quizResults,
  onAnswerSelect,
  onNextQuestion,
  onClose
}: QuizModalProps) {
  if (!isOpen || !quiz) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {!isQuizCompleted ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{quiz.title}</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                  <span>Difficulty: {'★'.repeat(quiz.difficulty)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {quiz.questions[currentQuestionIndex] && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">
                    {quiz.questions[currentQuestionIndex].question}
                  </h4>
                  
                  <div className="space-y-2">
                    {quiz.questions[currentQuestionIndex].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => onAnswerSelect(index)}
                        className={`w-full p-3 text-left border rounded-lg transition-colors ${
                          userAnswers[currentQuestionIndex] === index
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={onNextQuestion}
                      disabled={userAnswers[currentQuestionIndex] === undefined}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentQuestionIndex < quiz.questions.length - 1 ? 'Next' : 'Finish'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">Quiz Results</h3>
                <div className="space-y-4">
                  {quizResults.map((result, index) => (
                    <div key={result.questionId} className="text-left p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Question {index + 1}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.isCorrect 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {result.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      {result.explanation && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">{result.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={onClose}
                  className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}