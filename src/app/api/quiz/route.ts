import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

// Helper function to get admin ID from token
async function getAdminId(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    return payload?.id || null;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    const difficulty = searchParams.get('difficulty');
    const adminView = searchParams.get('admin') === 'true';

    const whereClause: any = {};
    
    // For regular users, only show active quizzes
    if (!adminView) {
      whereClause.isActive = true;
    }

    if (topicId) {
      whereClause.topicId = topicId;
    }

    if (difficulty) {
      whereClause.difficulty = parseInt(difficulty);
    }

    const quizzes = await db.quiz.findMany({
      where: whereClause,
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        },
        questions: {
          select: {
            id: true,
            question: true,
            options: true,
            correctAnswer: adminView, // Only include correct answers for admin
            explanation: true
          }
        },
        _count: {
          select: {
            questions: true,
            attempts: adminView // Only include attempt count for admin
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Process options for all quizzes
    const processedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        options: JSON.parse(q.options)
      }))
    }));

    return NextResponse.json(processedQuizzes);
  } catch (error) {
    console.error('Quiz API GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if this is a quiz submission or quiz creation
    const body = await request.json();
    
    if (body.sessionId && body.quizId && body.answers) {
      // This is a quiz submission
      return await handleQuizSubmission(body);
    } else if (body.title && body.topicId && body.questions) {
      // This is quiz creation (admin only)
      return await handleQuizCreation(request, body);
    } else {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
  } catch (error) {
    console.error('Quiz API POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleQuizSubmission(body: any) {
  const { sessionId, quizId, answers } = body;

  if (!sessionId || !quizId || !answers) {
    return NextResponse.json({ error: 'sessionId, quizId, and answers are required' }, { status: 400 });
  }

  // Get quiz with correct answers
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: true
    }
  });

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }

  // Calculate score
  let score = 0;
  const results = [];

  for (let i = 0; i < quiz.questions.length; i++) {
    const question = quiz.questions[i];
    const userAnswer = answers[i];
    const isCorrect = userAnswer === question.correctAnswer;
    
    if (isCorrect) {
      score++;
    }

    results.push({
      questionId: question.id,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation
    });
  }

  // Save quiz attempt
  const attempt = await db.quizAttempt.create({
    data: {
      sessionId,
      quizId,
      score,
      totalQuestions: quiz.questions.length,
      answers: JSON.stringify(answers)
    }
  });

  return NextResponse.json({
    attemptId: attempt.id,
    score,
    totalQuestions: quiz.questions.length,
    percentage: Math.round((score / quiz.questions.length) * 100),
    results
  });
}

async function handleQuizCreation(request: NextRequest, body: any) {
  const adminId = await getAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description, topicId, difficulty, isActive = true, questions } = body;

  if (!title || !topicId || !questions || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ 
      error: 'Title, topic ID, and at least one question are required' 
    }, { status: 400 });
  }

  // Validate that topic exists
  const topic = await db.topic.findUnique({
    where: { id: topicId }
  });

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  // Validate and process questions
  const validQuestions = questions.filter(q => 
    q.question && 
    q.options && 
    Array.isArray(q.options) && 
    q.options.length >= 2 &&
    typeof q.correctAnswer === 'number' &&
    q.correctAnswer >= 0 && 
    q.correctAnswer < q.options.length
  );

  if (validQuestions.length === 0) {
    return NextResponse.json({ error: 'At least one valid question is required' }, { status: 400 });
  }

  // Create quiz with questions
  const quiz = await db.quiz.create({
    data: {
      title,
      description: description || null,
      topicId,
      adminId,
      difficulty: difficulty || 1,
      isActive,
      questions: {
        create: validQuestions.map(q => ({
          question: q.question,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || null
        }))
      }
    },
    include: {
      topic: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true
        }
      },
      questions: {
        select: {
          id: true,
          question: true,
          options: true,
          correctAnswer: true,
          explanation: true
        }
      },
      _count: {
        select: {
          questions: true,
          attempts: true
        }
      }
    }
  });

  // Process options for response
  const processedQuiz = {
    ...quiz,
    questions: quiz.questions.map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }))
  };

  return NextResponse.json(processedQuiz);
}

export async function PUT(request: NextRequest) {
  try {
    const adminId = await getAdminId(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, title, description, topicId, difficulty, isActive, questions } = await request.json();

    if (!id || !title || !topicId) {
      return NextResponse.json({ 
        error: 'ID, title, and topic ID are required' 
      }, { status: 400 });
    }

    // Check if quiz exists and belongs to admin
    const existingQuiz = await db.quiz.findFirst({
      where: { 
        id,
        adminId 
      }
    });

    if (!existingQuiz) {
      return NextResponse.json({ error: 'Quiz not found or access denied' }, { status: 404 });
    }

    // Validate that topic exists
    const topic = await db.topic.findUnique({
      where: { id: topicId }
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Update quiz
    const updateData: any = {
      title,
      description: description || null,
      topicId,
      difficulty: difficulty || 1,
      isActive: isActive !== undefined ? isActive : true
    };

    // If questions are provided, update them too
    if (questions && Array.isArray(questions)) {
      // Delete existing questions
      await db.quizQuestion.deleteMany({
        where: { quizId: id }
      });

      // Validate and create new questions
      const validQuestions = questions.filter(q => 
        q.question && 
        q.options && 
        Array.isArray(q.options) && 
        q.options.length >= 2 &&
        typeof q.correctAnswer === 'number' &&
        q.correctAnswer >= 0 && 
        q.correctAnswer < q.options.length
      );

      if (validQuestions.length > 0) {
        updateData.questions = {
          create: validQuestions.map(q => ({
            question: q.question,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || null
          }))
        };
      }
    }

    const quiz = await db.quiz.update({
      where: { id },
      data: updateData,
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        },
        questions: {
          select: {
            id: true,
            question: true,
            options: true,
            correctAnswer: true,
            explanation: true
          }
        },
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      }
    });

    // Process options for response
    const processedQuiz = {
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        options: JSON.parse(q.options)
      }))
    };

    return NextResponse.json(processedQuiz);
  } catch (error) {
    console.error('Update quiz error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminId = await getAdminId(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    // Check if quiz exists and belongs to admin
    const existingQuiz = await db.quiz.findFirst({
      where: { 
        id,
        adminId 
      }
    });

    if (!existingQuiz) {
      return NextResponse.json({ error: 'Quiz not found or access denied' }, { status: 404 });
    }

    // Delete quiz (this will also delete questions and attempts due to cascade)
    await db.quiz.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete quiz error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}