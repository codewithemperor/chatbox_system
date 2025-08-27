import { db } from './src/lib/db';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
  console.log('🌱 Seeding database with COM1111 content...');

  // Create Topics
  const topics = await Promise.all([
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

  // Create FAQs
  const faqs = await Promise.all([
    // Programming Basics FAQs
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is a programming language?',
        answer: 'A programming language is a formal language designed to communicate instructions to a computer. It provides a way to write programs that can be executed by a computer to perform specific tasks. Examples include Python, Java, C++, and JavaScript. Programming languages have syntax (rules for writing code) and semantics (meaning of the code).',
        keywords: JSON.stringify(['programming language', 'code', 'syntax', 'semantics', 'python', 'java', 'c++', 'javascript']),
        topicId: topics[0].id
      }
    }),
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What are variables in programming?',
        answer: 'Variables are containers that store data values in a program. They have a name (identifier) and can hold different types of data such as numbers, text, or boolean values. Variables allow programmers to store and manipulate data throughout their program. For example: `int age = 25;` or `string name = "John";`',
        keywords: JSON.stringify(['variables', 'data', 'storage', 'identifier', 'declaration', 'assignment']),
        topicId: topics[0].id
      }
    }),
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is the difference between compiled and interpreted languages?',
        answer: 'Compiled languages (like C++, Java) are translated into machine code before execution by a compiler. This creates an executable file that runs directly on the computer. Interpreted languages (like Python, JavaScript) are executed line by line by an interpreter at runtime. Compiled languages generally run faster, while interpreted languages are more flexible and easier to debug.',
        keywords: JSON.stringify(['compiled', 'interpreted', 'compiler', 'interpreter', 'execution', 'runtime']),
        topicId: topics[0].id
      }
    }),

    // Algorithms FAQs
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is an algorithm?',
        answer: 'An algorithm is a step-by-step procedure or formula for solving a problem. It is a sequence of instructions that, when followed, will produce a desired output for a given input. Algorithms are the foundation of computer science and are used to solve problems efficiently. They can be expressed in natural language, flowcharts, or programming languages.',
        keywords: JSON.stringify(['algorithm', 'procedure', 'steps', 'problem solving', 'instructions', 'sequence']),
        topicId: topics[1].id
      }
    }),
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is time complexity in algorithms?',
        answer: 'Time complexity is a measure of how the runtime of an algorithm grows as the input size increases. It helps analyze the efficiency of algorithms and predict how they will perform with large inputs. Common time complexities include O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic, and O(2^n) exponential.',
        keywords: JSON.stringify(['time complexity', 'big o', 'efficiency', 'runtime', 'analysis', 'performance']),
        topicId: topics[1].id
      }
    }),
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is the difference between BFS and DFS?',
        answer: 'Breadth-First Search (BFS) explores all neighbor nodes at the present depth before moving to nodes at the next depth level. It uses a queue data structure. Depth-First Search (DFS) explores as far as possible along each branch before backtracking. It uses a stack data structure. BFS is better for finding the shortest path, while DFS uses less memory.',
        keywords: JSON.stringify(['bfs', 'dfs', 'breadth first search', 'depth first search', 'graph traversal', 'queue', 'stack']),
        topicId: topics[1].id
      }
    }),

    // Data Structures FAQs
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is an array?',
        answer: 'An array is a data structure that stores a fixed-size sequential collection of elements of the same type. Elements in an array are stored in contiguous memory locations and can be accessed randomly using indices. Arrays provide O(1) time complexity for access operations but O(n) for search and insertion operations.',
        keywords: JSON.stringify(['array', 'data structure', 'elements', 'indices', 'contiguous memory', 'access']),
        topicId: topics[2].id
      }
    }),
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is a linked list?',
        answer: 'A linked list is a linear data structure where elements are stored in nodes, and each node contains a data field and a reference (link) to the next node in the sequence. Unlike arrays, linked lists allow efficient insertion and deletion operations (O(1) time complexity) but have O(n) time complexity for access operations.',
        keywords: JSON.stringify(['linked list', 'nodes', 'pointers', 'insertion', 'deletion', 'singly', 'doubly']),
        topicId: topics[2].id
      }
    }),
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is a stack?',
        answer: 'A stack is a linear data structure that follows the Last-In-First-Out (LIFO) principle. Elements can be added (pushed) and removed (popped) only from one end called the top. Common operations include push (add element), pop (remove element), peek (view top element), and isEmpty. Stacks are used in function calls, expression evaluation, and backtracking algorithms.',
        keywords: JSON.stringify(['stack', 'lifo', 'push', 'pop', 'peek', 'top', 'last in first out']),
        topicId: topics[2].id
      }
    }),

    // Computer Architecture FAQs
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is the CPU?',
        answer: 'The Central Processing Unit (CPU) is the primary component of a computer that performs most of the processing. It executes instructions from programs and performs arithmetic, logical, control, and input/output operations. The CPU consists of the arithmetic logic unit (ALU), control unit (CU), and registers. Modern CPUs have multiple cores for parallel processing.',
        keywords: JSON.stringify(['cpu', 'central processing unit', 'processor', 'alu', 'control unit', 'registers', 'cores']),
        topicId: topics[3].id
      }
    }),
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is RAM?',
        answer: 'Random Access Memory (RAM) is a type of computer memory that can be accessed randomly; any byte of memory can be accessed without touching the preceding bytes. RAM is volatile memory, meaning it loses its contents when the computer is turned off. It is used to store data that the CPU needs quick access to, such as running programs and open files.',
        keywords: JSON.stringify(['ram', 'random access memory', 'volatile', 'memory', 'storage', 'quick access']),
        topicId: topics[3].id
      }
    }),

    // Operating Systems FAQs
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is an operating system?',
        answer: 'An operating system (OS) is system software that manages computer hardware and software resources and provides common services for computer programs. The OS acts as an intermediary between users and computer hardware. It manages memory, processes, devices, and file systems. Examples include Windows, macOS, Linux, iOS, and Android.',
        keywords: JSON.stringify(['operating system', 'os', 'system software', 'resource management', 'windows', 'linux', 'macos']),
        topicId: topics[4].id
      }
    }),
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is a process in operating systems?',
        answer: 'A process is an instance of a running program. It includes the program code, data, stack, heap, and process control block (PCB). The OS manages processes through scheduling, synchronization, and communication. Processes can be in different states: new, ready, running, waiting, or terminated. Each process has its own memory space.',
        keywords: JSON.stringify(['process', 'program', 'scheduling', 'states', 'pcb', 'memory space', 'management']),
        topicId: topics[4].id
      }
    }),

    // Networking FAQs
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is the Internet?',
        answer: 'The Internet is a global network of interconnected computers and devices that communicate using standard Internet Protocol (IP). It enables the sharing of information and resources through various services like email, file sharing, and the World Wide Web. The Internet uses TCP/IP protocols and relies on infrastructure like routers, switches, and servers.',
        keywords: JSON.stringify(['internet', 'network', 'tcp/ip', 'protocol', 'www', 'global', 'communication']),
        topicId: topics[5].id
      }
    }),
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is IP address?',
        answer: 'An IP (Internet Protocol) address is a unique numerical label assigned to each device connected to a computer network that uses the Internet Protocol for communication. IP addresses serve two main functions: host or network interface identification and location addressing. There are two versions: IPv4 (32-bit) and IPv6 (128-bit).',
        keywords: JSON.stringify(['ip address', 'internet protocol', 'ipv4', 'ipv6', 'network', 'identification', 'addressing']),
        topicId: topics[5].id
      }
    }),

    // Software Development FAQs
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is the software development life cycle?',
        answer: 'The Software Development Life Cycle (SDLC) is a process used by the software industry to design, develop, and test high-quality software. It consists of several phases: Requirements gathering, Design, Implementation/Coding, Testing, Deployment, and Maintenance. Different SDLC models include Waterfall, Agile, Spiral, and DevOps.',
        keywords: JSON.stringify(['sdlc', 'software development life cycle', 'phases', 'waterfall', 'agile', 'testing', 'deployment']),
        topicId: topics[6].id
      }
    }),
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is version control?',
        answer: 'Version control is a system that records changes to files over time so that you can recall specific versions later. It allows multiple developers to work on the same project simultaneously, track changes, and collaborate effectively. Git is the most popular version control system, with platforms like GitHub, GitLab, and Bitbucket providing hosting services.',
        keywords: JSON.stringify(['version control', 'git', 'github', 'collaboration', 'tracking', 'repository', 'branches']),
        topicId: topics[6].id
      }
    }),

    // Database Systems FAQs
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is a database?',
        answer: 'A database is an organized collection of structured information, or data, typically stored electronically in a computer system. Databases are managed by Database Management Systems (DBMS) and allow users to create, read, update, and delete data. They provide data integrity, security, and efficient access to large amounts of information.',
        keywords: JSON.stringify(['database', 'dbms', 'data', 'structured information', 'management', 'storage', 'access']),
        topicId: topics[7].id
      }
    }),
    db.fAQ.create({
      data: {
        id: uuidv4(),
        question: 'What is SQL?',
        answer: 'SQL (Structured Query Language) is a domain-specific language used in programming and designed for managing data held in a relational database management system (RDBMS). It is used for tasks such as query, insert, update, delete, and schema creation and modification. Common SQL commands include SELECT, INSERT, UPDATE, DELETE, CREATE, and DROP.',
        keywords: JSON.stringify(['sql', 'structured query language', 'database', 'rdbms', 'query', 'commands', 'relational']),
        topicId: topics[7].id
      }
    })
  ]);

  console.log(`✅ Created ${faqs.length} FAQs`);

  // Create Quizzes
  const quizzes = await Promise.all([
    // Programming Basics Quiz
    db.quiz.create({
      data: {
        id: uuidv4(),
        title: 'Programming Basics Quiz',
        description: 'Test your knowledge of fundamental programming concepts',
        topicId: topics[0].id,
        difficulty: 1,
        questions: {
          create: [
            {
              id: uuidv4(),
              question: 'Which of the following is NOT a programming language?',
              options: JSON.stringify(['Python', 'HTML', 'Java', 'C++']),
              correctAnswer: 1,
              explanation: 'HTML is a markup language, not a programming language. It is used for creating web pages but does not have programming logic capabilities.'
            },
            {
              id: uuidv4(),
              question: 'What does a variable store?',
              options: JSON.stringify(['Only numbers', 'Data values', 'Program code', 'Computer hardware']),
              correctAnswer: 1,
              explanation: 'Variables store data values of various types including numbers, strings, booleans, and other data types.'
            },
            {
              id: uuidv4(),
              question: 'Which language type is executed line by line?',
              options: JSON.stringify(['Compiled', 'Interpreted', 'Assembly', 'Machine code']),
              correctAnswer: 1,
              explanation: 'Interpreted languages are executed line by line by an interpreter at runtime, unlike compiled languages which are translated to machine code before execution.'
            }
          ]
        }
      }
    }),

    // Algorithms Quiz
    db.quiz.create({
      data: {
        id: uuidv4(),
        title: 'Algorithms Quiz',
        description: 'Challenge yourself with algorithm concepts',
        topicId: topics[1].id,
        difficulty: 2,
        questions: {
          create: [
            {
              id: uuidv4(),
              question: 'What is the time complexity of binary search?',
              options: JSON.stringify(['O(1)', 'O(n)', 'O(log n)', 'O(n²)']),
              correctAnswer: 2,
              explanation: 'Binary search has O(log n) time complexity because it halves the search space with each comparison.'
            },
            {
              id: uuidv4(),
              question: 'Which data structure is used by BFS?',
              options: JSON.stringify(['Stack', 'Queue', 'Array', 'Linked List']),
              correctAnswer: 1,
              explanation: 'Breadth-First Search uses a queue data structure to keep track of nodes to visit, ensuring nodes are explored level by level.'
            },
            {
              id: uuidv4(),
              question: 'What does Big O notation measure?',
              options: JSON.stringify(['Memory usage', 'Code length', 'Time complexity', 'Number of bugs']),
              correctAnswer: 2,
              explanation: 'Big O notation measures the time complexity or space complexity of an algorithm, describing how it scales with input size.'
            }
          ]
        }
      }
    }),

    // Data Structures Quiz
    db.quiz.create({
      data: {
        id: uuidv4(),
        title: 'Data Structures Quiz',
        description: 'Test your understanding of data structures',
        topicId: topics[2].id,
        difficulty: 2,
        questions: {
          create: [
            {
              id: uuidv4(),
              question: 'Which data structure follows LIFO principle?',
              options: JSON.stringify(['Queue', 'Stack', 'Array', 'Linked List']),
              correctAnswer: 1,
              explanation: 'Stack follows the Last-In-First-Out (LIFO) principle where the last element added is the first one to be removed.'
            },
            {
              id: uuidv4(),
              question: 'What is the time complexity for accessing an element in an array by index?',
              options: JSON.stringify(['O(1)', 'O(n)', 'O(log n)', 'O(n²)']),
              correctAnswer: 0,
              explanation: 'Array access by index has O(1) time complexity because elements are stored in contiguous memory locations and can be accessed directly.'
            },
            {
              id: uuidv4(),
              question: 'In a linked list, each node contains:',
              options: JSON.stringify(['Only data', 'Data and next pointer', 'Only next pointer', 'Data and previous pointer']),
              correctAnswer: 1,
              explanation: 'Each node in a singly linked list contains data and a pointer (reference) to the next node in the sequence.'
            }
          ]
        }
      }
    })
  ]);

  console.log(`✅ Created ${quizzes.length} quizzes`);

  console.log('🎉 Database seeding completed successfully!');
  console.log(`Summary:`);
  console.log(`- Topics: ${topics.length}`);
  console.log(`- FAQs: ${faqs.length}`);
  console.log(`- Quizzes: ${quizzes.length}`);
}

seedDatabase()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });