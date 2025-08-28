import { X, BookOpen } from 'lucide-react';

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

interface TopicSidebarProps {
  topics: Topic[];
  isOpen: boolean;
  onClose: () => void;
  onTopicClick: (topic: Topic) => void;
}

export default function TopicSidebar({ topics, isOpen, onClose, onTopicClick }: TopicSidebarProps) {
  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
      transform transition-transform duration-300 ease-in-out
      lg:relative lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">COM1111 Topics</h2>
            <button
              onClick={onClose}
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
                onClick={() => onTopicClick(topic)}
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
                        {topic._count.notes} Notes
                      </span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        {topic._count.faqs} FAQs
                      </span>
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
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
  );
}