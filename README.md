# 🎓 COM1111 Chatbox System

An intelligent educational chat platform designed for computer science learning, featuring **AI-powered tutoring**, **hybrid intelligence responses**, interactive assessments, and comprehensive content management for the Introduction to Computer Science course.

## 🌟 Overview

The COM1111 Chatbox System is a full-stack educational platform that combines **hybrid AI intelligence** with structured learning content, quizzes, and administrative tools. It provides students with an intelligent learning experience while giving instructors/admins powerful content management capabilities.

### 🎯 Key Features

#### For Students
- **🤖 Hybrid AI-Powered Chat Assistant**: Intelligent tutoring that prioritizes curated course content, with AI fallback for broader questions
- **🧠 Smart Content Matching**: Advanced algorithm matches questions to database content with scoring system
- **📝 Interactive Quizzes**: Engaging assessments with immediate feedback and explanations
- **🗂️ Topic Navigation**: Easy browsing of course materials organized by topic
- **📊 Progress Tracking**: Monitor learning progress and quiz performance
- **🎨 Beautiful UI**: Modern interface with SweetAlert2 notifications and responsive design

#### For Administrators/Instructors
- **📈 Admin Dashboard**: Comprehensive overview of system statistics and content with loading states
- **📝 Content Management**: Full CRUD operations for topics, notes, FAQs, and quizzes
- **🔐 User Authentication**: Secure JWT-based authentication system with proper error handling
- **🔍 Search & Filtering**: Efficient content discovery and management
- **⚡ Real-time Updates**: Live content updates and student interaction tracking

## 🚀 NEW FEATURES - v2.0

### 🤖 Enhanced AI Intelligence
- **Hybrid Response System**: Prioritizes database content first, falls back to AI for broader questions
- **Smart Matching Algorithm**: Advanced scoring system with keyword, topic, and content analysis
- **AI Agent Integration**: Uses z-ai-web-dev-sdk for intelligent responses when database content is insufficient
- **Context-Aware Responses**: AI considers existing course materials when generating responses

### 💬 Improved Chat Experience
- **Database-First Approach**: Only uses verified course content from the database
- **Honest Fallbacks**: When no information is available, clearly states limitations rather than making up answers
- **Enhanced Matching**: Searches both FAQs and Notes with intelligent scoring
- **Related Terms**: Expands search with related computer science terminology

### 🎨 Better User Experience
- **SweetAlert2 Integration**: Beautiful, professional notifications instead of basic browser alerts
- **Loading States**: Proper loading indicators throughout the application
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Component Architecture**: Well-organized, reusable components for better maintainability

## 🏗️ Architecture & Methodology

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (SQLite)      │
│                 │    │                 │    │                 │
│ • React 19      │    │ • JWT Auth      │    │ • Prisma ORM    │
│ • TypeScript    │    │ • REST APIs     │    │ • Relational   │
│ • Tailwind CSS  │    │ • Middleware    │    │ • Schema        │
│ • shadcn/ui     │    │ • Validation    │    │ • Relations     │
│ • SweetAlert2   │    │ • AI Agent      │    │ • Content       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                    ┌─────────────────┐
                    │   AI Agent      │
                    │   (z-ai-sdk)    │
                    │                 │
                    │ • Chat GPT       │
                    │ • Context Aware │
                    │ • Fallback      │
                    └─────────────────┘
```

### Methodology

#### 1. **Hybrid Intelligence Approach**
- **Database-First**: Always prioritizes curated course content from the database
- **AI Fallback**: Uses AI agent when no good database match is found (score < 3)
- **Smart Scoring**: Advanced matching algorithm with multi-point scoring system
- **Honest Responses**: Clearly states when information is not available

#### 2. **Advanced Matching Algorithm**
The system uses a sophisticated scoring mechanism:

```javascript
Scoring System:
- Keyword Match: 5 points (exact keyword from database)
- Topic Match: 4 points (matches course topic)
- Title Word: 2 points (matches question/title words)
- Content Word: 0.5 points (matches answer content, capped at 3)
- Related Terms: 1 point (matches related terminology)

Minimum threshold: 3 points for database response
Below threshold: AI agent provides response
```

#### 3. **AI Integration Strategy**
- **Context Provision**: AI receives database content as context for relevant responses
- **Guidelines**: AI is instructed to only answer computer science-related questions
- **Fallback Safety**: If AI fails, system provides honest limitations message
- **Educational Focus**: AI maintains teaching assistant role with clear boundaries

#### 4. **Component-Based Architecture**
- **Modular Design**: Reusable components for better maintainability
- **Separation of Concerns**: Clear separation between UI, logic, and data layers
- **Type Safety**: Comprehensive TypeScript typing throughout
- **Error Boundaries**: Graceful error handling at component level

## 🗄️ Database Schema

### Core Entities

#### **Admin** (`Admin`)
Manages system content and has authentication credentials.
```sql
- id: String (Primary Key)
- email: String (Unique)
- password: String (Hashed)
- name: String
- role: String (Default: "admin")
- isActive: Boolean (Default: true)
- createdAt/updatedAt: DateTime
```

#### **Topic** (`Topic`)
Organizes content into logical course sections.
```sql
- id: String (Primary Key)
- name: String (Unique)
- description: String (Optional)
- icon: String (Optional - Emoji)
- color: String (Optional - Hex color)
- createdAt/updatedAt: DateTime
```

#### **Note** (`Note`)
Detailed learning materials created by administrators.
```sql
- id: String (Primary Key)
- title: String
- content: String (Rich text)
- keywords: String (JSON array for search)
- topicId: String (Foreign Key)
- adminId: String (Foreign Key)
- isActive: Boolean (Default: true)
- createdAt/updatedAt: DateTime
```

#### **FAQ** (`FAQ`)
Frequently asked questions for quick reference.
```sql
- id: String (Primary Key)
- question: String
- answer: String
- keywords: String (JSON array for matching)
- topicId: String (Foreign Key)
- createdAt/updatedAt: DateTime
```

#### **Quiz** (`Quiz`)
Assessments with multiple choice questions.
```sql
- id: String (Primary Key)
- title: String
- description: String (Optional)
- topicId: String (Foreign Key)
- adminId: String (Foreign Key)
- difficulty: Int (1-5 scale)
- isActive: Boolean (Default: true)
- createdAt/updatedAt: DateTime
```

#### **QuizQuestion** (`QuizQuestion`)
Individual questions within quizzes.
```sql
- id: String (Primary Key)
- quizId: String (Foreign Key)
- question: String
- options: String (JSON array)
- correctAnswer: Int (Index)
- explanation: String (Optional)
- createdAt: DateTime
```

### Interaction Tracking

#### **ChatSession** (`ChatSession`)
Tracks individual user sessions.
```sql
- id: String (Primary Key)
- sessionId: String (Unique)
- userAgent: String (Optional)
- ipAddress: String (Optional)
- createdAt/updatedAt: DateTime
```

#### **ChatLog** (`ChatLog`)
Records all chat interactions.
```sql
- id: String (Primary Key)
- sessionId: String (Foreign Key)
- userQuery: String
- botResponse: String
- faqId: String (Optional - Foreign Key)
- noteId: String (Optional - Foreign Key)
- timestamp: DateTime
```

#### **QuizAttempt** (`QuizAttempt`)
Tracks quiz completion and scores.
```sql
- id: String (Primary Key)
- sessionId: String (Foreign Key)
- quizId: String (Foreign Key)
- score: Int
- totalQuestions: Int
- answers: String (JSON array)
- completedAt: DateTime
```

#### **Feedback** (`Feedback`)
User feedback on chat responses.
```sql
- id: String (Primary Key)
- chatLogId: String (Foreign Key)
- rating: Int (1=thumbs down, 2=thumbs up)
- comment: String (Optional)
- createdAt: DateTime
```

### Relationships

```
Admin ──┬── Note ────┬── Topic
        │            │
        ├── Quiz ──────┤
        │            │
        └── QuizQuestion
        │
Topic ──┬── FAQ
        │
        └── ChatLog ────┬── Feedback
                       │
                       └── ChatSession ─── QuizAttempt
```

## 🛠️ Enhanced Technology Stack

### Frontend
- **⚡ Next.js 15** - React framework with App Router
- **📘 TypeScript 5** - Type-safe JavaScript
- **🎨 Tailwind CSS 4** - Utility-first CSS framework
- **🧩 shadcn/ui** - High-quality UI components
- **🎯 Lucide React** - Icon library
- **🌈 next-themes** - Dark/light mode support
- **🍭 SweetAlert2** - Beautiful notifications and modals
- **📦 React Components** - Modular, reusable architecture

### Backend
- **🗄️ Prisma** - Next-generation ORM
- **🔐 JWT Authentication** - Secure token-based auth
- **📊 REST APIs** - Clean API design
- **🛡️ Middleware** - Route protection and validation
- **🤖 AI Integration** - z-ai-web-dev-sdk for intelligent responses
- **⚡ Real-time** - Socket.io for live interactions

### Database
- **💾 SQLite** - Lightweight, file-based database
- **🔄 Prisma Migrations** - Database schema management
- **🔍 Relational Design** - Structured data relationships
- **📊 Content Schema** - Optimized for educational content

### AI & Intelligence
- **🧠 z-ai-web-dev-sdk** - AI agent integration
- **🎯 Smart Matching** - Advanced content discovery algorithm
- **📚 Context Awareness** - AI considers existing course materials
- **🛡️ Safety Fallbacks** - Graceful handling of unknown topics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd chatbox_system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data (includes 8 topics, 11 FAQs, 4 quizzes)
npx tsx prisma/seed.ts
```

4. **Start the development server**
```bash
npm run dev
```

5. **Access the application**
- **Student Interface**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

### Default Admin Credentials
- **Email**: `admin@com1111.edu`
- **Password**: `admin123`

## 🎨 Key Features in Detail

### 🤖 Hybrid AI Chat System
- **Database-First Responses**: Always prioritizes curated course content
- **Intelligent Matching**: Advanced scoring system with multiple matching criteria
- **AI Fallback**: Uses AI agent when database content is insufficient (score < 3)
- **Honest Limitations**: Clearly states when information is not available
- **Context Integration**: AI considers existing course materials for relevant responses

#### Smart Matching Algorithm
```javascript
// Multi-point scoring system
const scoring = {
  keywordMatch: 5,      // Exact keyword from database
  topicMatch: 4,       // Matches course topic
  titleWord: 2,        // Matches question/title words  
  contentWord: 0.5,    // Matches answer content (capped at 3)
  relatedTerms: 1      // Matches related terminology
};

// Threshold-based response selection
if (totalScore >= 3) {
  return databaseContent;
} else {
  return await aiResponse(userMessage, databaseContext);
}
```

### 📈 Enhanced Admin Dashboard
- **Loading States**: Proper loading indicators throughout
- **Error Handling**: Comprehensive error handling with retry functionality
- **Real Statistics**: Live data from database with proper authentication
- **Activity Tracking**: Recent content updates and user interactions
- **Quick Actions**: Easy navigation to management features

### 🎨 SweetAlert2 Integration
- **Beautiful Notifications**: Replaces basic browser alerts with professional modals
- **Quiz Completion**: Elegant result displays with score information
- **Feedback System**: User-friendly feedback collection
- **Error Messages**: Professional error handling with clear messaging

### 🧩 Component Architecture
- **Modular Design**: Reusable components for better maintainability
- **Chat Components**: Separate components for messages, input, and sidebar
- **Quiz Components**: Modular quiz interface with result display
- **UI Consistency**: Unified design system with shadcn/ui

### 📊 Interactive Assessment System
- **Dynamic Quizzes**: Multiple choice questions with immediate feedback
- **Difficulty Levels**: 5-tier difficulty system for progressive learning
- **Performance Tracking**: Score calculation and attempt history
- **Explanations**: Detailed explanations for correct and incorrect answers
- **SweetAlert Results**: Beautiful result displays with performance metrics

### 🔍 Enhanced Content Discovery
- **FAQ & Note Search**: Searches both content types with intelligent scoring
- **Keyword Optimization**: Advanced keyword matching and analysis
- **Topic Organization**: Content organized by course topics
- **Related Terms**: Expanded search with computer science terminology

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Route Protection**: Middleware protects admin routes
- **Input Validation**: Type-safe form handling with validation
- **SQL Injection Prevention**: Parameterized queries with Prisma ORM
- **XSS Protection**: Built-in Next.js security features
- **AI Safety**: AI agent restricted to computer science topics

## 🚀 Deployment

### Environment Variables
Create a `.env` file with the following variables:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Database Considerations
- **Development**: SQLite file database (included)
- **Production**: Consider PostgreSQL/MySQL for better performance
- **Backups**: Regular database backups recommended
- **Migrations**: Use Prisma migrations for schema changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the excellent React framework
- **Prisma Team** - For the modern database toolkit
- **shadcn/ui** - For the beautiful UI components
- **Tailwind CSS** - For the utility-first CSS framework

---

Built with ❤️ for educational excellence. Enhancing computer science learning through intelligent technology. 🎓