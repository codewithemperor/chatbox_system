'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, BookOpen, Brain, Menu, Trophy } from 'lucide-react';
import Swal from 'sweetalert2';
import SwalReact from 'sweetalert2-react-content';

// Components
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import TopicSidebar from '@/components/chat/TopicSidebar';
import QuizModal from '@/components/quiz/QuizModal';

const SwAlert = SwalReact(Swal);

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
    notes: number;
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
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  
  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
      // Generate a simple session ID only on client side
      const newSessionId = 'session_' + Date.now();
      setSessionId(newSessionId);
      
      // Load data from API
      await Promise.all([fetchTopics(), fetchQuizzes()]);
      
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

  // Fetch data from API
  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics');
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quiz');
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    }
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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          sessionId: sessionId || 'session_' + Date.now() 
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: 'assistant',
          timestamp: new Date(),
          chatLogId: data.chatLogId,
          topic: data.topic
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback response if API fails
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'I apologize, but I\'m having trouble processing your request right now. Please try again later.',
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('Chat API error:', error);
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m having trouble connecting to my knowledge base. Please try again later.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (chatLogId: string, rating: number) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatLogId, rating })
      });

      if (response.ok) {
        await SwAlert.fire({
          icon: 'success',
          title: 'Thank you!',
          text: 'Your feedback has been submitted successfully.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Feedback error:', error);
      await SwAlert.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit feedback. Please try again.',
      });
    }
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
  const handleTakeQuizClick = async () => {
    // Check if there are any quizzes available
    if (quizzes.length === 0) {
      await SwAlert.fire({
        icon: 'info',
        title: 'No Quizzes Available',
        text: 'There are currently no quizzes available. Please check back later!',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Check if there are topics with quizzes
    const topicsWithQuizzes = topics.filter(topic => 
      quizzes.some(quiz => quiz.topicId === topic.id)
    );

    if (topicsWithQuizzes.length === 0) {
      await SwAlert.fire({
        icon: 'info',
        title: 'No Quiz Topics Available',
        text: 'There are currently no topics with available quizzes. Please check back later!',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Open the quiz modal for topic/quiz selection
    setIsQuizModalOpen(true);
  };

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

  const finishQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: selectedQuiz.id,
          answers: userAnswers,
          sessionId: sessionId || 'session_' + Date.now()
        })
      });

      const data = await response.json();

      if (data.success) {
        setQuizResults(data.results);
        setIsQuizCompleted(true);
        
        const score = data.results.filter((r: QuizResult) => r.isCorrect).length;
        const total = data.results.length;
        
        await SwAlert.fire({
          icon: score >= total * 0.7 ? 'success' : 'info',
          title: 'Quiz Completed!',
          html: `You scored <strong>${score}</strong> out of <strong>${total}</strong>`,
          showConfirmButton: true,
          confirmButtonText: 'Review Results'
        });
      } else {
        await SwAlert.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to submit quiz. Please try again.',
        });
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      await SwAlert.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit quiz. Please try again.',
      });
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizResults([]);
    setIsQuizCompleted(false);
    setIsQuizModalOpen(false);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Topic Sidebar */}
      <TopicSidebar
        topics={topics}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onTopicClick={handleTopicClick}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-muted"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <Brain className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">COM1111 Assistant</h1>
                  <p className="text-sm text-muted-foreground">
                    Introduction to Computer Science
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleTakeQuizClick}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center gap-2 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                Take Quiz
              </button>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {messages.length <= 1 && (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Welcome to COM1111 Assistant!
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  I'm here to help you learn Introduction to Computer Science concepts. 
                  Ask me questions or explore topics from the sidebar.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {topics.slice(0, 3).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic)}
                      className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <BookOpen className="h-4 w-4" />
                      {topic.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onFeedback={handleFeedback}
              />
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-card border rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isQuizModalOpen}
        quiz={selectedQuiz}
        currentQuestionIndex={currentQuestionIndex}
        userAnswers={userAnswers}
        isQuizCompleted={isQuizCompleted}
        quizResults={quizResults}
        topics={topics}
        quizzes={quizzes}
        onAnswerSelect={handleAnswerSelect}
        onNextQuestion={handleNextQuestion}
        onQuizSelect={startQuiz}
        onClose={resetQuiz}
      />
    </div>
  );
}