# 🎓 COM1111 Chatbox System

An intelligent educational chat platform designed for computer science learning, featuring AI-powered tutoring, interactive assessments, and comprehensive content management for the Introduction to Computer Science course.

## 🌟 Overview

The COM1111 Chatbox System is a full-stack educational platform that combines AI-powered chat assistance with structured learning content, quizzes, and administrative tools. It provides students with an interactive learning experience while giving instructors/admins powerful content management capabilities.

### 🎯 Key Features

#### For Students
- **AI-Powered Chat Assistant**: Intelligent tutoring that responds to questions using curated course content
- **Interactive Quizzes**: Engaging assessments with immediate feedback and explanations
- **Topic Navigation**: Easy browsing of course materials organized by topic
- **Progress Tracking**: Monitor learning progress and quiz performance
- **Responsive Design**: Seamless experience across desktop and mobile devices

#### For Administrators/Instructors
- **Admin Dashboard**: Comprehensive overview of system statistics and content
- **Content Management**: Full CRUD operations for topics, notes, FAQs, and quizzes
- **User Authentication**: Secure JWT-based authentication system
- **Search & Filtering**: Efficient content discovery and management
- **Real-time Updates**: Live content updates and student interaction tracking

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
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Methodology

#### 1. **Content-First AI Approach**
- AI responses are generated from curated educational content rather than general knowledge
- Administrators create structured notes and FAQs that serve as knowledge base
- Keyword-based matching ensures relevant and accurate responses
- Priority system: Notes (1.5x weight) > FAQs (1.0x weight)

#### 2. **Modular Design Pattern**
- Component-based architecture using shadcn/ui
- Reusable UI components with consistent styling
- Separation of concerns between presentation and business logic
- Type-safe development with TypeScript

#### 3. **Database-Driven Content**
- Centralized content management with relational database
- Topic-based organization for structured learning
- Audit trails with timestamps and user tracking
- Cascading relationships for data integrity

#### 4. **Security-First Implementation**
- JWT-based authentication with secure password hashing
- Role-based access control (Admin vs User)
- Protected routes with middleware
- Input validation and sanitization

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

## 🛠️ Technology Stack

### Frontend
- **⚡ Next.js 15** - React framework with App Router
- **📘 TypeScript 5** - Type-safe JavaScript
- **🎨 Tailwind CSS 4** - Utility-first CSS framework
- **🧩 shadcn/ui** - High-quality UI components
- **🎯 Lucide React** - Icon library
- **🌈 next-themes** - Dark/light mode support

### Backend
- **🗄️ Prisma** - Next-generation ORM
- **🔐 JWT Authentication** - Secure token-based auth
- **📊 REST APIs** - Clean API design
- **🛡️ Middleware** - Route protection and validation

### Database
- **💾 SQLite** - Lightweight, file-based database
- **🔄 Prisma Migrations** - Database schema management
- **🔍 Relational Design** - Structured data relationships

### Authentication & Security
- **🔐 bcryptjs** - Password hashing
- **🎫 jsonwebtoken** - JWT token management
- **🛡️ Route Protection** - Middleware-based security
- **✅ Input Validation** - Type-safe form handling

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

# Seed the database with sample data
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

## 📁 Project Structure

```
chatbox_system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Admin dashboard pages
│   │   │   ├── login/          # Admin login page
│   │   │   ├── layout.tsx      # Admin layout
│   │   │   ├── page.tsx        # Admin dashboard
│   │   │   ├── topics/         # Topics management
│   │   │   ├── notes/          # Notes management
│   │   │   ├── quizzes/        # Quizzes management
│   │   │   └── faqs/           # FAQs management
│   │   ├── api/                # API routes
│   │   │   ├── admin/          # Admin APIs
│   │   │   ├── chat/           # Chat functionality
│   │   │   ├── quiz/           # Quiz operations
│   │   │   ├── topics/         # Topic data
│   │   │   ├── notes/          # Note management
│   │   │   ├── faqs/           # FAQ management
│   │   │   ├── session/        # Session handling
│   │   │   ├── feedback/       # User feedback
│   │   │   └── health/         # Health check
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page (chat interface)
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── db.ts               # Database client
│   │   ├── socket.ts           # Socket.io setup
│   │   └── utils.ts            # Helper functions
│   └── globals.css            # Global styles
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Database migrations
├── public/                     # Static assets
├── package.json               # Dependencies and scripts
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── next.config.ts            # Next.js configuration
└── README.md                 # This file
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database

# Code Quality
npm run lint         # Run ESLint
```

## 🎨 Key Features in Detail

### AI-Powered Chat System
- **Content-Based Responses**: AI generates responses from admin-created notes and FAQs
- **Keyword Matching**: Intelligent matching using keyword arrays and content analysis
- **Priority System**: Notes weighted higher than FAQs for comprehensive answers
- **Session Tracking**: Persistent chat sessions with history
- **Feedback System**: Users can rate responses for continuous improvement

### Admin Content Management
- **Topics Management**: Create and organize course topics with icons and colors
- **Notes Management**: Rich text content with keyword tagging for better search
- **Quizzes Management**: Build assessments with multiple questions and difficulty levels
- **FAQs Management**: Quick reference materials with keyword optimization
- **Search & Filter**: Efficient content discovery across all management pages

### Interactive Assessment System
- **Dynamic Quizzes**: Multiple choice questions with immediate feedback
- **Difficulty Levels**: 5-tier difficulty system for progressive learning
- **Performance Tracking**: Score calculation and attempt history
- **Explanations**: Detailed explanations for correct and incorrect answers
- **Progress Visualization**: Visual progress indicators during quizzes

### User Experience
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark/Light Mode**: Theme switching with system preference detection
- **Loading States**: Proper loading indicators throughout the application
- **Error Handling**: User-friendly error messages and validation
- **Accessibility**: WCAG-compliant design with keyboard navigation

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Route Protection**: Middleware protects admin routes
- **Input Validation**: Type-safe form handling with validation
- **SQL Injection Prevention**: Parameterized queries with Prisma ORM
- **XSS Protection**: Built-in Next.js security features

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