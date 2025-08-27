import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const topics = await db.topic.findMany({
      include: {
        _count: {
          select: {
            faqs: true,
            quizzes: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(topics);
  } catch (error) {
    console.error('Topics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}