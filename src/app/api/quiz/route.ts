import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    const difficulty = searchParams.get('difficulty');

    const whereClause: any = {
      isActive: true
    };

    if (topicId) {
      whereClause.topicId = topicId;
    }

    if (difficulty) {
      whereClause.difficulty = parseInt(difficulty);
    }

    const quizzes = await db.quiz.findMany({
      where: whereClause,
      include: {
        topic: true,
        questions: {
          select: {
            id: true,
            question: true,
            options: true,
            explanation: true
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Don't send correct answers to the client
    const sanitizedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        options: JSON.parse(q.options)
      }))
    }));

    return NextResponse.json(sanitizedQuizzes);
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, quizId, answers } = await request.json();

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

  } catch (error) {
    console.error('Quiz submission API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}