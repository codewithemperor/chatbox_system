import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (sessionId) {
      // Check if session exists
      const existingSession = await db.chatSession.findUnique({
        where: { sessionId }
      });

      if (existingSession) {
        return NextResponse.json({
          sessionId: existingSession.sessionId,
          exists: true
        });
      }
    }

    // Create new session
    const newSessionId = uuidv4();
    const session = await db.chatSession.create({
      data: {
        sessionId: newSessionId,
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
      }
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      exists: false
    });

  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = await db.chatSession.findUnique({
      where: { sessionId },
      include: {
        chatLogs: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 50 // Get last 50 messages
        },
        quizAttempts: {
          orderBy: {
            completedAt: 'desc'
          },
          take: 10,
          include: {
            quiz: {
              select: {
                title: true,
                topic: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);

  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}