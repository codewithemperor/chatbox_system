import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get counts
    const [totalTopics, totalNotes, totalQuizzes, totalFaqs] = await Promise.all([
      db.topic.count(),
      db.note.count({ where: { isActive: true } }),
      db.quiz.count({ where: { isActive: true } }),
      db.fAQ.count()
    ]);

    // Get recent activity
    const recentNotes = await db.note.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    });

    const recentQuizzes = await db.quiz.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    });

    const recentFaqs = await db.fAQ.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        question: true,
        createdAt: true
      }
    });

    // Combine and sort recent activity
    const recentActivity = [
      ...recentNotes.map(note => ({ ...note, type: 'note' as const, title: note.title })),
      ...recentQuizzes.map(quiz => ({ ...quiz, type: 'quiz' as const, title: quiz.title })),
      ...recentFaqs.map(faq => ({ ...faq, type: 'faq' as const, title: faq.question }))
    ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

    return NextResponse.json({
      totalTopics,
      totalNotes,
      totalQuizzes,
      totalFaqs,
      recentActivity
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}