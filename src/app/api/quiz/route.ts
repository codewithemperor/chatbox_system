import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const quizzes = await db.quiz.findMany({
      where: { isActive: true },
      include: {
        topic: true,
        questions: true,
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}