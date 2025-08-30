import { X, Trophy, BookOpen } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string; // This is a JSON string, not an array
  correctAnswer: number;
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

interface Topic {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  _count: {
    faqs: number;
    quizzes: number;
    notes: number;
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
  topics: Topic[];
  quizzes: Quiz[];
  onAnswerSelect: (answerIndex: number) => void;
  onNextQuestion: () => void;
  onQuizSelect: (quiz: Quiz) => void;
  onClose: () => void;
}

export default function QuizModal({
  isOpen,
  quiz,
  currentQuestionIndex,
  userAnswers,
  isQuizCompleted,
  quizResults,
  topics,
  quizzes,
  onAnswerSelect,
  onNextQuestion,
  onQuizSelect,
  onClose
}: QuizModalProps) {
  if (!isOpen) return null;

  // Helper function to safely parse options
  const parseOptions = (optionsString: string): string[] => {
    try {
      return JSON.parse(optionsString);
    } catch (error) {
      console.error('Error parsing options:', error);
      return [];
    }
  };

  // If no quiz is selected, show topic and quiz selection
  if (!quiz) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold">Select a Quiz</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-6">
              {topics.map((topic) => {
                const topicQuizzes = quizzes.filter(q => q.topicId === topic.id);
                
                if (topicQuizzes.length === 0) return null;
                
                return (
                  <div key={topic.id} className="space-y-3">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span>{topic.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({topicQuizzes.length} quiz{topicQuizzes.length !== 1 ? 'es' : ''})
                      </span>
                    </div>
                    
                    <div className="grid gap-3">
                      {topicQuizzes.map((topicQuiz) => (
                        <button
                          key={topicQuiz.id}
                          onClick={() => onQuizSelect(topicQuiz)}
                          className="p-4 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{topicQuiz.title}</h4>
                              {topicQuiz.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {topicQuiz.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                              <div>{'★'.repeat(topicQuiz.difficulty)}</div>
                              <div>{topicQuiz._count.questions} questions</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {quizzes.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    No quizzes available at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentOptions = currentQuestion ? parseOptions(currentQuestion.options) : [];

  // Show quiz questions when a quiz is selected
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
              
              {currentQuestion && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">
                    {currentQuestion.question}
                  </h4>
                  
                  <div className="space-y-2">
                    {currentOptions.map((option, index) => (
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Quiz Results</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {quizResults.filter(r => r.isCorrect).length} / {quizResults.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {Math.round((quizResults.filter(r => r.isCorrect).length / quizResults.length) * 100)}% Correct
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {quizResults.map((result, index) => {
                  const question = quiz.questions.find(q => q.id === result.questionId);
                  const options = question ? parseOptions(question.options) : [];
                  
                  return (
                    <div key={result.questionId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Question {index + 1}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.isCorrect 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {result.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      
                      {question && (
                        <div className="space-y-2">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {question.question}
                          </p>
                          
                          <div className="space-y-1">
                            <div className={`p-2 rounded text-sm ${
                              result.isCorrect 
                                ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}>
                              <span className="font-medium">Your answer: </span>
                              {options[result.userAnswer] || 'No answer selected'}
                            </div>
                            
                            {!result.isCorrect && (
                              <div className="p-2 rounded text-sm bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200">
                                <span className="font-medium">Correct answer: </span>
                                {options[result.correctAnswer]}
                              </div>
                            )}
                          </div>
                          
                          {result.explanation && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900 rounded text-sm text-blue-800 dark:text-blue-200">
                              <span className="font-medium">Explanation: </span>
                              {result.explanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-center mt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Close Results
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}