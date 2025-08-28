import { MessageSquare, Brain, ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    chatLogId?: string;
    topic?: string;
  };
  onFeedback: (chatLogId: string, rating: number) => void;
}

export default function ChatMessage({ message, onFeedback }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                onClick={() => onFeedback(message.chatLogId!, 2)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                title="Thumbs up"
              >
                <ThumbsUp className="h-3 w-3" />
              </button>
              <button
                onClick={() => onFeedback(message.chatLogId!, 1)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                title="Thumbs down"
              >
                <ThumbsDown className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">You</span>
        </div>
      )}
    </div>
  );
}