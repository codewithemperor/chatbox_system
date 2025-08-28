import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { quizId, answers, sessionId } = await request.json();

    if (!quizId || !answers || !sessionId) {
      return NextResponse.json({ error: 'QuizId, answers, and sessionId are required' }, { status: 400 });
    }

    // Get quiz with questions
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Create or get chat session
    let chatSession = await db.chatSession.findUnique({
      where: { sessionId }
    });

    if (!chatSession) {
      chatSession = await db.chatSession.create({
        data: {
          sessionId
        }
      });
    }

    // Calculate results
    const results = quiz.questions.map((question, index) => {
      const userAnswer = answers[index] !== undefined ? answers[index] : -1;
      const isCorrect = userAnswer === question.correctAnswer;
      
      return {
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation || null
      };
    });

    // Create quiz attempt
    await db.quizAttempt.create({
      data: {
        sessionId: chatSession.sessionId,
        quizId: quiz.id,
        score: results.filter(r => r.isCorrect).length,
        totalQuestions: results.length,
        answers: JSON.stringify(answers)
      }
    });

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Quiz submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}