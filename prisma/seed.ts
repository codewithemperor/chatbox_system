import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
  console.log('🌱 Seeding database with COM1111 content...');

  // Get or create admin user first
  let admin = await db.admin.findFirst();
  if (!admin) {
    console.log('Creating admin user...');
    admin = await db.admin.create({
      data: {
        id: uuidv4(),
        email: 'admin@com1111.edu',
        password: hashPassword('admin123'),
        name: 'Sulaimon Yusuf',
        role: 'admin',
        isActive: true
      }
    });
    console.log('✅ Created admin user');
  } else {
    console.log('✅ Found existing admin user');
  }

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
      if (topic && admin) {
        await db.quiz.create({
          data: {
            id: uuidv4(),
            title: quizInfo.title,
            description: quizInfo.description,
            topicId: topic.id,
            adminId: admin.id,
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

  // Get existing notes or create new ones
  const existingNotes = await db.note.findMany();
  if (existingNotes.length < 12) {
    console.log('Creating sample notes...');
    
    // Get all topics for mapping
    const allTopics = await db.topic.findMany();
    const topicMap = new Map(allTopics.map(t => [t.name, t]));
    
    const notesData = [
      // Programming Basics Notes
      {
        title: 'Introduction to Programming Languages',
        content: `Programming languages are formal languages designed to communicate instructions to a computer. They are the foundation of software development and enable developers to create applications, websites, and systems.

There are several types of programming languages:

1. **High-Level Languages**: These are closer to human language and easier to read and write. Examples include Python, Java, and JavaScript. They abstract away complex hardware details.

2. **Low-Level Languages**: These are closer to machine code and provide more direct control over hardware. Examples include Assembly and Machine Code.

3. **Compiled Languages**: These are translated directly into machine code before execution. Examples include C, C++, and Go. They typically offer better performance.

4. **Interpreted Languages**: These are executed line-by-line by an interpreter at runtime. Examples include Python, JavaScript, and Ruby. They offer more flexibility.

When choosing a programming language, consider factors like:
- Project requirements and scope
- Performance needs
- Development time and ease of use
- Community support and available libraries
- Target platform and deployment environment`,
        keywords: JSON.stringify(['programming language', 'high-level', 'low-level', 'compiled', 'interpreted', 'software development']),
        topicName: 'Programming Basics'
      },
      {
        title: 'Understanding Variables and Data Types',
        content: `Variables are fundamental building blocks in programming that store data values. Think of them as containers that hold information which can be changed during program execution.

**Variable Declaration and Initialization:**
- Declaration: Specifying the variable's name and type
- Initialization: Assigning an initial value to the variable

**Common Data Types:**

1. **Integer**: Whole numbers without decimal points
   - Examples: 42, -17, 0
   - Used for counting, indexing, and mathematical operations

2. **Floating-Point**: Numbers with decimal points
   - Examples: 3.14, -0.5, 2.0
   - Used for precise calculations and measurements

3. **String**: Sequence of characters
   - Examples: "Hello, World!", "John Doe", "12345"
   - Used for text manipulation and display

4. **Boolean**: Logical values representing true or false
   - Examples: true, false
   - Used for conditional logic and decision making

5. **Character**: Single alphanumeric symbols
   - Examples: 'A', 'b', '7', '$'
   - Used for text processing and character manipulation

**Variable Naming Conventions:**
- Use descriptive names that indicate the variable's purpose
- Start with a letter or underscore
- Avoid spaces and special characters
- Follow camelCase or snake_case conventions
- Be consistent throughout your code

**Best Practices:**
- Initialize variables when declaring them
- Use appropriate data types for your data
- Choose meaningful variable names
- Keep variable scope as small as possible
- Use constants for values that don't change`,
        keywords: JSON.stringify(['variables', 'data types', 'integer', 'string', 'boolean', 'float', 'character', 'declaration']),
        topicName: 'Programming Basics'
      },
      {
        title: 'Control Structures: Conditional Statements',
        content: `Control structures are programming constructs that allow you to control the flow of your program's execution. Conditional statements enable your program to make decisions based on certain conditions.

**If Statements:**
The most basic conditional statement that executes code only if a specified condition is true.

\`\`\`python
if condition:
    # Code to execute if condition is true
\`\`\`

**If-Else Statements:**
Provides an alternative path when the condition is false.

\`\`\`python
if condition:
    # Code if condition is true
else:
    # Code if condition is false
\`\`\`

**Else-If Ladder:**
Allows multiple conditions to be checked in sequence.

\`\`\`python
if condition1:
    # Code if condition1 is true
elif condition2:
    # Code if condition2 is true
else:
    # Code if all conditions are false
\`\`\`

**Switch Statements:**
A cleaner way to handle multiple conditions based on a single variable value.

\`\`\`javascript
switch (variable) {
    case value1:
        // Code for value1
        break;
    case value2:
        // Code for value2
        break;
    default:
        // Code if no cases match
}
\`\`\`

**Conditional Operators:**
- Equal to (==, ===)
- Not equal to (!=, !==)
- Greater than (>)
- Less than (<)
- Greater than or equal to (>=)
- Less than or equal to (<=)

**Logical Operators:**
- AND (&&, and): All conditions must be true
- OR (||, or): At least one condition must be true
- NOT (!, not): Reverses the logical state

**Best Practices:**
- Keep conditions simple and readable
- Use proper indentation
- Consider all possible cases
- Avoid nested conditionals when possible
- Use meaningful variable names in conditions`,
        keywords: JSON.stringify(['control structures', 'conditional statements', 'if', 'else', 'switch', 'operators', 'logic', 'decision making']),
        topicName: 'Programming Basics'
      },
      // Algorithms Notes
      {
        title: 'Introduction to Algorithms and Problem Solving',
        content: `An algorithm is a step-by-step procedure for solving a problem or accomplishing a task. In computer science, algorithms are the foundation of all computational processes.

**Key Characteristics of Good Algorithms:**

1. **Finiteness**: An algorithm must always terminate after a finite number of steps.
2. **Well-Defined**: Each step must be precisely defined and unambiguous.
3. **Input**: An algorithm takes zero or more inputs.
4. **Output**: An algorithm produces at least one output.
5. **Effectiveness**: Every instruction must be basic enough that it can be carried out.

**Algorithm Design Process:**

1. **Problem Analysis**: Understand the problem thoroughly
   - Identify inputs and outputs
   - Determine constraints and requirements
   - Consider edge cases

2. **Algorithm Development**: Create a step-by-step solution
   - Break down the problem into smaller subproblems
   - Design the logic flow
   - Consider different approaches

3. **Implementation**: Write the code
   - Choose appropriate data structures
   - Implement the algorithm efficiently
   - Add error handling

4. **Testing and Verification**: Ensure correctness
   - Test with various inputs
   - Check edge cases
   - Verify performance

**Common Algorithm Categories:**

1. **Sorting Algorithms**: Arrange elements in a specific order
   - Bubble Sort, Quick Sort, Merge Sort, Heap Sort

2. **Searching Algorithms**: Find specific elements in data
   - Linear Search, Binary Search, Hash Table Lookup

3. **Graph Algorithms**: Work with network structures
   - Breadth-First Search, Depth-First Search, Dijkstra's Algorithm

4. **Dynamic Programming**: Solve complex problems by breaking them down
   - Fibonacci Sequence, Knapsack Problem, Longest Common Subsequence

**Algorithm Analysis:**
- **Time Complexity**: How runtime grows with input size
- **Space Complexity**: How memory usage grows with input size
- **Big O Notation**: Mathematical notation for describing complexity

**Best Practices:**
- Choose the right algorithm for your specific problem
- Consider time and space constraints
- Optimize for the most common use cases
- Document your algorithms clearly
- Test thoroughly with various inputs`,
        keywords: JSON.stringify(['algorithm', 'problem solving', 'complexity', 'big o', 'design', 'analysis', 'optimization', 'efficiency']),
        topicName: 'Algorithms'
      },
      {
        title: 'Understanding Time and Space Complexity',
        content: `Time and space complexity are fundamental concepts in algorithm analysis that help us understand how efficient an algorithm is.

**Time Complexity:**
Time complexity measures how the runtime of an algorithm grows as the input size increases. It's typically expressed using Big O notation.

**Common Time Complexities:**

1. **O(1) - Constant Time**: Runtime doesn't change with input size
   - Examples: Accessing an array element by index, hash table lookup
   - Most efficient complexity

2. **O(log n) - Logarithmic Time**: Runtime grows logarithmically with input size
   - Examples: Binary search, balanced tree operations
   - Very efficient for large datasets

3. **O(n) - Linear Time**: Runtime grows linearly with input size
   - Examples: Linear search, iterating through an array
   - Efficient for most practical purposes

4. **O(n log n) - Linearithmic Time**: Runtime grows in proportion to n log n
   - Examples: Merge sort, quick sort (average case)
   - Good for sorting algorithms

5. **O(n²) - Quadratic Time**: Runtime grows quadratically with input size
   - Examples: Bubble sort, nested loops
   - Less efficient for large datasets

6. **O(2^n) - Exponential Time**: Runtime doubles with each addition to input
   - Examples: Recursive Fibonacci, brute-force problems
   - Generally impractical for large inputs

**Space Complexity:**
Space complexity measures how much additional memory an algorithm uses as the input size grows.

**Space Complexity Categories:**

1. **O(1) - Constant Space**: Uses fixed amount of additional space
   - Examples: In-place algorithms, iterative solutions
   - Most space-efficient

2. **O(n) - Linear Space**: Uses additional space proportional to input size
   - Examples: Creating a copy of an array, recursive solutions
   - Reasonable for most applications

3. **O(n²) - Quadratic Space**: Uses space proportional to n²
   - Examples: Creating adjacency matrices for graphs
   - Can be memory-intensive

**Analysis Techniques:**

1. **Best Case**: Minimum time/space required
2. **Average Case**: Expected performance across all inputs
3. **Worst Case**: Maximum time/space required
4. **Amortized Analysis**: Average performance over a sequence of operations

**Optimization Strategies:**
- Choose appropriate data structures
- Avoid unnecessary nested loops
- Use memoization or caching
- Consider trade-offs between time and space
- Profile and measure actual performance

**Practical Considerations:**
- Big O notation describes growth rate, not actual runtime
- Constants and lower-order terms are ignored in Big O
- Real-world performance depends on hardware and implementation
- Sometimes a "worse" algorithm performs better on typical inputs`,
        keywords: JSON.stringify(['time complexity', 'space complexity', 'big o', 'analysis', 'optimization', 'efficiency', 'performance', 'algorithm']),
        topicName: 'Algorithms'
      },
      // Data Structures Notes
      {
        title: 'Arrays: The Fundamental Data Structure',
        content: `Arrays are one of the most fundamental and widely used data structures in computer science. They store elements in contiguous memory locations, allowing efficient access to elements by their index.

**Key Characteristics of Arrays:**

1. **Fixed Size**: Most arrays have a fixed size determined at creation
2. **Contiguous Memory**: Elements are stored in adjacent memory locations
3. **Random Access**: Any element can be accessed in O(1) time using its index
4. **Homogeneous Elements**: All elements must be of the same data type

**Array Operations and Their Complexities:**

1. **Access by Index**: O(1)
   - Direct access using array_name[index]
   - Most efficient operation

2. **Search**: O(n)
   - Linear search through elements
   - Can be O(log n) if array is sorted (binary search)

3. **Insertion**: O(n)
   - Inserting at beginning or middle requires shifting elements
   - Inserting at end is O(1) if space is available

4. **Deletion**: O(n)
   - Deleting from beginning or middle requires shifting elements
   - Deleting from end is O(1)

5. **Traversal**: O(n)
   - Visiting each element exactly once

**Types of Arrays:**

1. **One-Dimensional Arrays**: Simple list of elements
   - Example: int[] numbers = {1, 2, 3, 4, 5};

2. **Multi-Dimensional Arrays**: Arrays of arrays
   - Example: int[][] matrix = {{1, 2}, {3, 4}, {5, 6}};

3. **Dynamic Arrays**: Arrays that can grow and shrink
   - Examples: ArrayList in Java, Vector in C++, list in Python
   - Automatically resize when needed

**Common Array Algorithms:**

1. **Linear Search**: Sequential search for an element
   - Simple but inefficient for large arrays

2. **Binary Search**: Efficient search on sorted arrays
   - Requires array to be sorted first
   - O(log n) time complexity

3. **Sorting**: Arrange elements in specific order
   - Bubble Sort, Selection Sort, Insertion Sort
   - Quick Sort, Merge Sort, Heap Sort

4. **Rotation**: Shift elements circularly
   - Left rotation and right rotation
   - Useful in various applications

**Advantages of Arrays:**
- Fast random access to elements
- Cache-friendly due to contiguous memory
- Simple to understand and implement
- Memory efficient (no extra storage for pointers)

**Disadvantages of Arrays:**
- Fixed size (in most implementations)
- Costly insertion and deletion operations
- May waste memory if allocated size is not fully used
- Not suitable for dynamic data that changes frequently

**Best Practices:**
- Use arrays when the number of elements is known in advance
- Choose appropriate size to avoid frequent resizing
- Consider using dynamic arrays for unknown sizes
- Be mindful of array bounds to prevent errors
- Use built-in array methods when available`,
        keywords: JSON.stringify(['array', 'data structure', 'index', 'access', 'search', 'sort', 'complexity', 'memory']),
        topicName: 'Data Structures'
      },
      {
        title: 'Linked Lists: Dynamic Data Structures',
        content: `Linked lists are linear data structures where elements are not stored in contiguous memory locations. Instead, each element (node) contains a reference (link) to the next node in the sequence.

**Basic Structure of a Linked List Node:**
\`\`\`python
class Node:
    def __init__(self, data):
        self.data = data    # The data stored in the node
        self.next = None   # Reference to the next node
\`\`\`

**Types of Linked Lists:**

1. **Singly Linked List**: Each node points to the next node
   - Simplest form
   - Can only traverse in one direction

2. **Doubly Linked List**: Each node points to both next and previous nodes
   - Allows bidirectional traversal
   - Uses more memory per node

3. **Circular Linked List**: Last node points back to the first node
   - Can be singly or doubly linked
   - Useful for applications requiring circular access

**Linked List Operations and Complexities:**

1. **Insertion**: O(1) at head, O(n) at tail or specific position
   - No need to shift elements
   - Simply update pointers

2. **Deletion**: O(1) at head, O(n) at tail or specific position
   - Update pointers to remove node
   - No shifting required

3. **Search**: O(n)
   - Must traverse from head
   - No random access

4. **Access by Index**: O(n)
   - Must traverse from beginning
   - Less efficient than arrays

**Advantages of Linked Lists:**
- Dynamic size: Can grow or shrink as needed
- Efficient insertion and deletion
- No memory waste (only allocate what's needed)
- Useful for implementing other data structures (stacks, queues)

**Disadvantages of Linked Lists:**
- No random access to elements
- Extra memory required for pointers
- Not cache-friendly (non-contiguous memory)
- More complex to implement and debug

**Common Linked List Applications:**

1. **Implementing Stacks and Queues**
   - Linked lists provide efficient push/pop operations

2. **Dynamic Memory Allocation**
   - Used in systems where memory allocation varies

3. **Navigation Systems**
   - Browser history (forward/back navigation)
   - Music playlists

4. **Polynomial Representation**
   - Each term can be represented as a node

**Basic Linked List Operations Implementation:**

**Insertion at Head:**
\`\`\`python
def insert_at_head(head, data):
    new_node = Node(data)
    new_node.next = head
    return new_node  # New head of the list
\`\`\`

**Deletion at Head:**
\`\`\`python
def delete_at_head(head):
    if head is None:
        return None
    new_head = head.next
    head.next = None  # Help garbage collection
    return new_head
\`\`\`

**Search Operation:**
\`\`\`python
def search(head, target):
    current = head
    while current is not None:
        if current.data == target:
            return True
        current = current.next
    return False
\`\`\`

**Best Practices:**
- Always handle edge cases (empty list, single node)
- Use dummy nodes to simplify insertion/deletion
- Consider memory management and garbage collection
- Choose the right type of linked list for your needs
- Document the structure and operations clearly`,
        keywords: JSON.stringify(['linked list', 'node', 'pointer', 'dynamic', 'insertion', 'deletion', 'singly', 'doubly']),
        topicName: 'Data Structures'
      }
    ];

    for (const noteData of notesData) {
      const topic = topicMap.get(noteData.topicName);
      if (topic && admin) {
        await db.note.create({
          data: {
            id: uuidv4(),
            title: noteData.title,
            content: noteData.content,
            keywords: noteData.keywords,
            topicId: topic.id,
            adminId: admin.id,
            isActive: true
          }
        });
      }
    }
    console.log('✅ Created sample notes');
  } else {
    console.log(`✅ Found ${existingNotes.length} existing notes`);
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