import { db } from '../src/lib/db';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
  console.log('🌱 Seeding database with COM1111 content...');

  // Get existing topics or create new ones
  const existingTopics = await db.topic.findMany();
  let topics = existingTopics;

  if (existingTopics.length === 0) {
    console.log('Creating new topics...');
    topics = await Promise.all([
      db.topic.create({
        data: {
          id: uuidv4(),
          name: 'Programming Basics',
          description: 'Fundamental concepts of programming and coding',
          icon: '💻',
          color: '#3B82F6'
        }
      }),
      db.topic.create({
        data: {
          id: uuidv4(),
          name: 'Algorithms',
          description: 'Step-by-step procedures for solving problems',
          icon: '🧮',
          color: '#10B981'
        }
      }),
      db.topic.create({
        data: {
          id: uuidv4(),
          name: 'Data Structures',
          description: 'Ways to organize and store data efficiently',
          icon: '🗂️',
          color: '#F59E0B'
        }
      }),
      db.topic.create({
        data: {
          id: uuidv4(),
          name: 'Computer Architecture',
          description: 'Hardware components and how computers work',
          icon: '🔧',
          color: '#EF4444'
        }
      }),
      db.topic.create({
        data: {
          id: uuidv4(),
          name: 'Operating Systems',
          description: 'System software that manages computer hardware',
          icon: '🖥️',
          color: '#8B5CF6'
        }
      }),
      db.topic.create({
        data: {
          id: uuidv4(),
          name: 'Networking',
          description: 'How computers communicate and share data',
          icon: '🌐',
          color: '#06B6D4'
        }
      }),
      db.topic.create({
        data: {
          id: uuidv4(),
          name: 'Software Development',
          description: 'Process of creating software applications',
          icon: '🚀',
          color: '#EC4899'
        }
      }),
      db.topic.create({
        data: {
          id: uuidv4(),
          name: 'Database Systems',
          description: 'Organized collections of data and their management',
          icon: '🗄️',
          color: '#84CC16'
        }
      })
    ]);
    console.log(`✅ Created ${topics.length} topics`);
  } else {
    console.log(`✅ Found ${existingTopics.length} existing topics`);
  }

  // Get existing FAQs or create new ones
  const existingFaqs = await db.fAQ.findMany();
  if (existingFaqs.length < 20) {
    console.log('Creating additional FAQs...');
    
    const topicMap = new Map(topics.map(t => [t.name, t]));
    
    const additionalFaqs = [
      // Programming Basics FAQs
      {
        question: 'What is a programming language?',
        answer: 'A programming language is a formal language designed to communicate instructions to a computer. It provides a way to write programs that can be executed by a computer to perform specific tasks. Examples include Python, Java, C++, and JavaScript. Programming languages have syntax (rules for writing code) and semantics (meaning of the code).',
        keywords: JSON.stringify(['programming language', 'code', 'syntax', 'semantics']),
        topicName: 'Programming Basics'
      },
      {
        question: 'What are variables in programming?',
        answer: 'Variables are containers for storing data values. In programming, a variable is a named location in memory that holds a value which can be changed during program execution. Variables have a name (identifier), a data type (like integer, string, boolean), and a value. For example: int age = 25; or string name = "John";',
        keywords: JSON.stringify(['variable', 'data', 'memory', 'identifier', 'data type']),
        topicName: 'Programming Basics'
      },
      {
        question: 'What is the difference between compiled and interpreted languages?',
        answer: 'Compiled languages (like C, C++, Go) are translated directly into machine code by a compiler before execution, resulting in faster performance. Interpreted languages (like Python, JavaScript, Ruby) are executed line-by-line by an interpreter at runtime, making them more flexible but generally slower. Some languages like Java use both compilation and interpretation.',
        keywords: JSON.stringify(['compiled', 'interpreted', 'compiler', 'interpreter', 'execution']),
        topicName: 'Programming Basics'
      },
      // Algorithms FAQs
      {
        question: 'What is an algorithm?',
        answer: 'An algorithm is a finite sequence of well-defined, computer-implementable instructions, typically to solve a class of problems or to perform a computation. Algorithms are the foundation of computer programming and are used for tasks like sorting data, searching information, and performing calculations.',
        keywords: JSON.stringify(['algorithm', 'instructions', 'problem solving', 'computation']),
        topicName: 'Algorithms'
      },
      {
        question: 'What is time complexity in algorithms?',
        answer: 'Time complexity is a measure of the amount of time an algorithm takes to run as a function of the length of its input. It\'s typically expressed using Big O notation, which describes the upper bound of the growth rate. Common time complexities include O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic, and O(2^n) exponential.',
        keywords: JSON.stringify(['time complexity', 'big o', 'efficiency', 'performance', 'analysis']),
        topicName: 'Algorithms'
      },
      // Data Structures FAQs
      {
        question: 'What is an array?',
        answer: 'An array is a data structure that stores a fixed-size sequential collection of elements of the same type. Arrays are indexed, meaning each element has a numerical index (starting from 0) that allows direct access to any element. Arrays are used for storing multiple values in a single variable and are fundamental in programming.',
        keywords: JSON.stringify(['array', 'collection', 'index', 'elements', 'fixed-size']),
        topicName: 'Data Structures'
      },
      {
        question: 'What is a linked list?',
        answer: 'A linked list is a linear data structure where elements are not stored at contiguous memory locations. Instead, each element (node) contains a data field and a reference (link) to the next node in the sequence. Linked lists allow efficient insertion and deletion of elements but have slower access times compared to arrays.',
        keywords: JSON.stringify(['linked list', 'node', 'pointer', 'dynamic', 'sequence']),
        topicName: 'Data Structures'
      },
      // Computer Architecture FAQs
      {
        question: 'What is the CPU?',
        answer: 'The Central Processing Unit (CPU) is the primary component of a computer that performs most of the processing. It\'s often called the "brain" of the computer. The CPU executes instructions from programs, performs arithmetic and logical operations, and manages data flow between other components. Key parts of the CPU include the Arithmetic Logic Unit (ALU), Control Unit, and registers.',
        keywords: JSON.stringify(['cpu', 'processor', 'alu', 'control unit', 'brain']),
        topicName: 'Computer Architecture'
      },
      {
        question: 'What is RAM?',
        answer: 'Random Access Memory (RAM) is a type of computer memory that can be read and changed in any order. It\'s used to store working data and machine code currently in use. RAM is volatile, meaning it loses its contents when the computer is turned off. More RAM generally allows a computer to work with more information at the same time, improving performance.',
        keywords: JSON.stringify(['ram', 'memory', 'volatile', 'storage', 'working data']),
        topicName: 'Computer Architecture'
      },
      // Operating Systems FAQs
      {
        question: 'What is an operating system?',
        answer: 'An operating system (OS) is system software that manages computer hardware and software resources and provides common services for computer programs. The OS acts as an intermediary between users and computer hardware. Major functions include process management, memory management, file systems, device control, and networking. Examples include Windows, macOS, Linux, iOS, and Android.',
        keywords: JSON.stringify(['operating system', 'os', 'system software', 'resource management', 'windows']),
        topicName: 'Operating Systems'
      },
      // Networking FAQs
      {
        question: 'What is the Internet Protocol (IP)?',
        answer: 'The Internet Protocol (IP) is the principal set of rules for routing and addressing data packets across networks so that they can reach their destinations. IP addresses are numerical labels assigned to each device connected to a computer network. The two main versions are IPv4 (32-bit addresses) and IPv6 (128-bit addresses). IP works with TCP to form TCP/IP, the foundation of internet communication.',
        keywords: JSON.stringify(['ip', 'internet protocol', 'addressing', 'routing', 'tcp/ip']),
        topicName: 'Networking'
      }
    ];

    for (const faqData of additionalFaqs) {
      const topic = topicMap.get(faqData.topicName);
      if (topic) {
        await db.fAQ.create({
          data: {
            id: uuidv4(),
            question: faqData.question,
            answer: faqData.answer,
            keywords: faqData.keywords,
            topicId: topic.id
          }
        });
      }
    }
    console.log('✅ Created additional FAQs');
  } else {
    console.log(`✅ Found ${existingFaqs.length} existing FAQs`);
  }

  // Get existing quizzes or create new ones
  const existingQuizzes = await db.quiz.findMany();
  if (existingQuizzes.length < 4) {
    console.log('Creating additional quizzes...');
    
    const topicMap = new Map(topics.map(t => [t.name, t]));
    
    const quizData = [
      // Programming Basics Quiz
      {
        title: 'Programming Basics Quiz',
        description: 'Test your knowledge of fundamental programming concepts',
        topicName: 'Programming Basics',
        difficulty: 1,
        questions: [
          {
            question: 'What is the purpose of a variable in programming?',
            options: ['To store data values', 'To execute code', 'To display output', 'To connect to the internet'],
            correctAnswer: 0,
            explanation: 'Variables are used to store data values that can be referenced and manipulated in a program.'
          },
          {
            question: 'Which of the following is NOT a programming language?',
            options: ['Python', 'HTML', 'Java', 'C++'],
            correctAnswer: 1,
            explanation: 'HTML is a markup language used for creating web pages, not a programming language.'
          },
          {
            question: 'What does "syntax" refer to in programming?',
            options: ['The meaning of the code', 'The rules for writing code', 'The speed of execution', 'The memory usage'],
            correctAnswer: 1,
            explanation: 'Syntax refers to the set of rules that define the combinations of symbols that are considered to be correctly structured programs in a language.'
          }
        ]
      },
      // Algorithms Quiz
      {
        title: 'Algorithms Quiz',
        description: 'Challenge yourself with algorithm concepts and complexity',
        topicName: 'Algorithms',
        difficulty: 2,
        questions: [
          {
            question: 'What is the time complexity of binary search?',
            options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
            correctAnswer: 1,
            explanation: 'Binary search has O(log n) time complexity because it halves the search space with each comparison.'
          },
          {
            question: 'Which sorting algorithm has the best average-case time complexity?',
            options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'],
            correctAnswer: 1,
            explanation: 'Quick Sort has an average-case time complexity of O(n log n), which is better than the O(n²) complexity of the other options.'
          },
          {
            question: 'What does Big O notation represent?',
            options: ['The exact runtime of an algorithm', 'The worst-case time complexity', 'The memory usage', 'The number of lines of code'],
            correctAnswer: 1,
            explanation: 'Big O notation describes the upper bound or worst-case scenario of an algorithm\'s time complexity.'
          }
        ]
      },
      // Data Structures Quiz
      {
        title: 'Data Structures Quiz',
        description: 'Test your understanding of how data is organized and stored',
        topicName: 'Data Structures',
        difficulty: 2,
        questions: [
          {
            question: 'Which data structure follows the LIFO principle?',
            options: ['Queue', 'Stack', 'Array', 'Linked List'],
            correctAnswer: 1,
            explanation: 'Stack follows the Last In First Out (LIFO) principle, where the last element added is the first one to be removed.'
          },
          {
            question: 'What is the main advantage of a hash table?',
            options: ['Ordered data storage', 'Constant time complexity for operations', 'Memory efficiency', 'Simple implementation'],
            correctAnswer: 1,
            explanation: 'Hash tables provide average O(1) time complexity for insert, delete, and search operations when properly implemented.'
          },
          {
            question: 'In a binary search tree, where is the left child of a node located?',
            options: ['Always at the beginning', 'With a value greater than the parent', 'With a value less than the parent', 'At the same level'],
            correctAnswer: 2,
            explanation: 'In a binary search tree, the left child of a node contains a value less than the node\'s value, and the right child contains a value greater than the node\'s value.'
          }
        ]
      },
      // Computer Architecture Quiz
      {
        title: 'Computer Architecture Quiz',
        description: 'Explore the hardware components that make up a computer',
        topicName: 'Computer Architecture',
        difficulty: 2,
        questions: [
          {
            question: 'Which component is responsible for performing arithmetic and logical operations?',
            options: ['Control Unit', 'ALU', 'RAM', 'Cache'],
            correctAnswer: 1,
            explanation: 'The Arithmetic Logic Unit (ALU) is responsible for performing arithmetic and logical operations in the CPU.'
          },
          {
            question: 'What is the purpose of cache memory?',
            options: ['Permanent storage', 'Fast temporary storage for frequently accessed data', 'Connecting peripherals', 'Managing power consumption'],
            correctAnswer: 1,
            explanation: 'Cache memory is a small, fast memory that stores frequently accessed data to reduce the time needed to access data from main memory.'
          },
          {
            question: 'Which of the following is volatile memory?',
            options: ['SSD', 'HDD', 'RAM', 'ROM'],
            correctAnswer: 2,
            explanation: 'RAM (Random Access Memory) is volatile memory, meaning it loses its contents when power is turned off.'
          }
        ]
      }
    ];

    for (const quizInfo of quizData) {
      const topic = topicMap.get(quizInfo.topicName);
      if (topic) {
        await db.quiz.create({
          data: {
            id: uuidv4(),
            title: quizInfo.title,
            description: quizInfo.description,
            topicId: topic.id,
            difficulty: quizInfo.difficulty,
            questions: {
              create: quizInfo.questions.map(q => ({
                id: uuidv4(),
                question: q.question,
                options: JSON.stringify(q.options),
                correctAnswer: q.correctAnswer,
                explanation: q.explanation
              }))
            }
          }
        });
      }
    }
    console.log('✅ Created additional quizzes');
  } else {
    console.log(`✅ Found ${existingQuizzes.length} existing quizzes`);
  }

  console.log('🎉 Database seeding completed successfully!');
}

seedDatabase()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });