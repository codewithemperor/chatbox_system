'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, BookOpen, Brain, Lightbulb, Send, ThumbsUp, ThumbsDown, Menu, X, Trophy, Play } from 'lucide-react';

// Mock data since we don't have the actual API
const mockTopics = [
  {
    id: '1',
    name: 'Introduction to Programming',
    description: 'Basic programming concepts and syntax',
    icon: '💻',
    color: 'blue',
    _count: { faqs: 12, quizzes: 3 }
  },
  {
    id: '2',
    name: 'Data Structures',
    description: 'Arrays, lists, stacks, and queues',
    icon: '🗂️',
    color: 'green',
    _count: { faqs: 8, quizzes: 2 }
  },
  {
    id: '3',
    name: 'Algorithms',
    description: 'Sorting, searching, and complexity',
    icon: '⚡',
    color: 'purple',
    _count: { faqs: 15, quizzes: 4 }
  }
];

const mockQuizzes = [
  {
    id: '1',
    title: 'Programming Basics',
    description: 'Test your understanding of basic programming concepts',
    topicId: '1',
    difficulty: 1,
    _count: { questions: 5 },
    questions: [
      {
        id: '1',
        question: 'What is a variable in programming?',
        options: [
          'A fixed value that cannot change',
          'A named storage location that can hold data',
          'A type of function',
          'A programming language'
        ],
        explanation: 'A variable is a named storage location in memory that can hold and change data during program execution.'
      }
    ]
  }
];

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  chatLogId?: string;
  topic?: string;
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
  };
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

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  explanation?: string;
}

interface QuizResult {
  questionId: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation?: string;
}

export default function Home() {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>(mockTopics);
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  
  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  
  // Quiz state
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session and load data
  useEffect(() => {
    const initializeApp = async () => {
      // Generate a simple session ID
      const newSessionId = 'session_' + Date.now();
      setSessionId(newSessionId);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        content: 'Hello! I\'m your COM1111 Assistant. I can help you learn Introduction to Computer Science concepts. Feel free to ask me questions about programming, data structures, algorithms, or any other topics!',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Chat functionality
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API response
    setTimeout(() => {
      const responses = [
        `Great question about ${input}! In COM1111, this topic is fundamental to understanding computer science concepts.`,
        `Let me explain that concept for you. This is an important part of your COM1111 curriculum.`,
        `That's a excellent question! This relates to several key concepts we cover in Introduction to Computer Science.`,
        `I'd be happy to help you understand that topic better. It's one of the core areas in COM1111.`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        role: 'assistant',
        timestamp: new Date(),
        chatLogId: 'chat_' + Date.now(),
        topic: topics[Math.floor(Math.random() * topics.length)]?.name
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleFeedback = async (chatLogId: string, rating: number) => {
    console.log(`Feedback submitted: ${chatLogId} - Rating: ${rating}`);
    // Show toast notification
    alert('Thank you for your feedback!');
  };

  const handleTopicClick = (topic: Topic) => {
    const topicMessage: Message = {
      id: Date.now().toString(),
      content: `Tell me about ${topic.name}`,
      role: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, topicMessage]);
    setIsSidebarOpen(false);
    setInput(`Tell me about ${topic.name}`);
  };

  // Quiz functionality
  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizResults([]);
    setIsQuizCompleted(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (selectedQuiz && currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!selectedQuiz) return;

    // Simulate quiz results (in real app, this would come from API)
    const results: QuizResult[] = selectedQuiz.questions.map((question, index) => ({
      questionId: question.id,
      userAnswer: userAnswers[index] || 0,
      correctAnswer: 1, // Simulated correct answer
      isCorrect: (userAnswers[index] || 0) === 1,
      explanation: question.explanation
    }));

    setQuizResults(results);
    setIsQuizCompleted(true);
    
    const score = results.filter(r => r.isCorrect).length;
    alert(`Quiz completed! You scored ${score} out of ${results.length}`);
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizResults([]);
    setIsQuizCompleted(false);
    setIsQuizModalOpen(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">COM1111 Topics</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Topics List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleTopicClick(topic)}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{topic.name}</h3>
                      {topic.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {topic.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          {topic._count.faqs} FAQs
                        </span>
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                          {topic._count.quizzes} Quizzes
                        </span>
                      </div>
                    </div>
                    {topic.icon && (
                      <span className="text-2xl ml-2">{topic.icon}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">COM1111 Assistant</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Introduction to Computer Science
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsQuizModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                Take Quiz
              </button>
              
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {messages.length <= 1 && (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to COM1111 Assistant!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  I'm here to help you learn Introduction to Computer Science concepts. 
                  Ask me questions or explore topics from the sidebar.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {topics.slice(0, 3).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <BookOpen className="h-4 w-4" />
                      {topic.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div className={`
                  max-w-[70%] rounded-lg px-4 py-3 
                  ${message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }
                `}>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  
                  {message.topic && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        <Lightbulb className="h-3 w-3" />
                        {message.topic}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </span>
                    
                    {message.role === 'assistant' && message.chatLogId && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleFeedback(message.chatLogId!, 2)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.chatLogId!, 1)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">You</span>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about COM1111 concepts..."
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedQuiz ? selectedQuiz.title : 'Choose a Quiz'}
                </h2>
                <button
                  onClick={() => setIsQuizModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {!selectedQuiz && (
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      onClick={() => startQuiz(quiz)}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{quiz.title}</h3>
                          {quiz.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {quiz.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                              {quiz._count.questions} Questions
                            </span>
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                              Level {quiz.difficulty}
                            </span>
                          </div>
                        </div>
                        <Play className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedQuiz && !isQuizCompleted && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                    </span>
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                      Level {selectedQuiz.difficulty}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }}
                    ></div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-medium mb-4 text-gray-900 dark:text-white">
                      {selectedQuiz.questions[currentQuestionIndex]?.question}
                    </h3>
                    
                    <div className="space-y-2">
                      {selectedQuiz.questions[currentQuestionIndex]?.options.map((option, index) => (
                        <label key={index} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="answer"
                            value={index}
                            checked={userAnswers[currentQuestionIndex] === index}
                            onChange={() => handleAnswerSelect(index)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      disabled={userAnswers[currentQuestionIndex] === undefined}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      {currentQuestionIndex === selectedQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
                    </button>
                  </div>
                </div>
              )}

              {selectedQuiz && isQuizCompleted && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quiz Completed!</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      You scored {quizResults.filter(r => r.isCorrect).length} out of {quizResults.length}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={resetQuiz}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => startQuiz(selectedQuiz)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}