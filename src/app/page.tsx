'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { MessageSquare, BookOpen, Brain, Lightbulb, Send, ThumbsUp, ThumbsDown, Menu, X, Trophy, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize session
    const initSession = async () => {
      try {
        const response = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: localStorage.getItem('sessionId') })
        });
        const data = await response.json();
        setSessionId(data.sessionId);
        localStorage.setItem('sessionId', data.sessionId);
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };

    // Load topics
    const loadTopics = async () => {
      try {
        const response = await fetch('/api/topics');
        const data = await response.json();
        setTopics(data);
      } catch (error) {
        console.error('Failed to load topics:', error);
      }
    };

    // Load quizzes
    const loadQuizzes = async () => {
      try {
        const response = await fetch('/api/quiz');
        const data = await response.json();
        setQuizzes(data);
      } catch (error) {
        console.error('Failed to load quizzes:', error);
      }
    };

    initSession();
    loadTopics();
    loadQuizzes();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
        body: JSON.stringify({ message: input, sessionId })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        chatLogId: data.chatLogId,
        topic: data.topic?.name
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (chatLogId: string, rating: number) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatLogId, rating })
      });
      
      toast({
        title: 'Thank you!',
        description: 'Your feedback helps us improve.',
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
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
    
    // Auto-submit the topic question
    setTimeout(() => {
      const form = document.getElementById('chat-form') as HTMLFormElement;
      if (form) {
        const input = form.querySelector('input') as HTMLInputElement;
        if (input) {
          input.value = `Tell me about ${topic.name}`;
          form.dispatchEvent(new Event('submit'));
        }
      }
    }, 100);
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizResults([]);
    setIsQuizCompleted(false);
    setIsQuizModalOpen(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (selectedQuiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!selectedQuiz || !sessionId) return;

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          quizId: selectedQuiz.id,
          answers: userAnswers
        })
      });

      const data = await response.json();
      setQuizResults(data.results);
      setIsQuizCompleted(true);

      toast({
        title: 'Quiz Completed!',
        description: `You scored ${data.score} out of ${data.totalQuestions} (${data.percentage}%)`,
      });
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit quiz. Please try again.',
        variant: 'destructive'
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-card border-r transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">COM1111 Topics</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4">
              <div className="space-y-3">
                {topics.map((topic) => (
                  <Card 
                    key={topic.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleTopicClick(topic)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{topic.name}</h3>
                          {topic.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {topic.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {topic._count.faqs} FAQs
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {topic._count.quizzes} Quizzes
                            </Badge>
                          </div>
                        </div>
                        {topic.icon && (
                          <div className="ml-2">
                            <span className="text-lg">{topic.icon}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 flex-shrink-0">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-lg font-semibold">COM1111 Assistant</h1>
                  <p className="text-xs text-muted-foreground">
                    Introduction to Computer Science
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Dialog open={isQuizModalOpen} onOpenChange={setIsQuizModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trophy className="h-4 w-4 mr-2" />
                    Take Quiz
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedQuiz ? selectedQuiz.title : 'Choose a Quiz'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  {!selectedQuiz && (
                    <div className="space-y-3">
                      {quizzes.map((quiz) => (
                        <Card 
                          key={quiz.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => startQuiz(quiz)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium">{quiz.title}</h3>
                                {quiz.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {quiz.description}
                                  </p>
                                )}
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {quiz._count.questions} Questions
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Level {quiz.difficulty}
                                  </Badge>
                                </div>
                              </div>
                              <Play className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {selectedQuiz && !isQuizCompleted && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                        </span>
                        <Badge variant="outline">
                          Level {selectedQuiz.difficulty}
                        </Badge>
                      </div>
                      
                      <Progress 
                        value={((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100} 
                        className="w-full"
                      />

                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-4">
                            {selectedQuiz.questions[currentQuestionIndex]?.question}
                          </h3>
                          
                          <RadioGroup
                            value={userAnswers[currentQuestionIndex]?.toString()}
                            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                          >
                            {selectedQuiz.questions[currentQuestionIndex]?.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                <Label htmlFor={`option-${index}`} className="text-sm">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </CardContent>
                      </Card>

                      <div className="flex justify-end">
                        <Button
                          onClick={handleNextQuestion}
                          disabled={userAnswers[currentQuestionIndex] === undefined}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        >
                          {currentQuestionIndex === selectedQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedQuiz && isQuizCompleted && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold">Quiz Completed!</h3>
                        <p className="text-sm text-muted-foreground">
                          You scored {quizResults.filter(r => r.isCorrect).length} out of {quizResults.length}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {quizResults.map((result, index) => (
                          <Card key={result.questionId} className={result.isCorrect ? 'border-green-200' : 'border-red-200'}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-sm">
                                  Question {index + 1}
                                </h4>
                                <Badge variant={result.isCorrect ? 'default' : 'destructive'}>
                                  {result.isCorrect ? 'Correct' : 'Incorrect'}
                                </Badge>
                              </div>
                              
                              <div className="text-xs space-y-1">
                                <p><strong>Your answer:</strong> {selectedQuiz.questions[index]?.options[result.userAnswer]}</p>
                                {!result.isCorrect && (
                                  <p><strong>Correct answer:</strong> {selectedQuiz.questions[index]?.options[result.correctAnswer]}</p>
                                )}
                                {result.explanation && (
                                  <p className="text-muted-foreground mt-2">{result.explanation}</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={resetQuiz}>
                          Close
                        </Button>
                        <Button onClick={() => startQuiz(selectedQuiz)}>
                          Try Again
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </Button>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Welcome to COM1111 Assistant!</h2>
                <p className="text-muted-foreground mb-4">
                  I'm here to help you learn Introduction to Computer Science concepts.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {topics.slice(0, 3).map((topic) => (
                    <Button
                      key={topic.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTopicClick(topic)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {topic.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  
                  {message.topic && (
                    <Badge variant="secondary" className="text-xs mt-2">
                      <Lightbulb className="h-3 w-3 mr-1" />
                      {message.topic}
                    </Badge>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </span>
                    
                    {message.role === 'assistant' && message.chatLogId && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleFeedback(message.chatLogId!, 2)}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleFeedback(message.chatLogId!, 1)}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">You</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area - Fixed at bottom */}
        <div className="border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 flex-shrink-0">
          <form
            id="chat-form"
            onSubmit={handleSubmit}
            className="p-4"
          >
            <div className="max-w-4xl mx-auto flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about COM1111 concepts..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}