import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { chatLogId, rating, comment } = await request.json();

    if (!chatLogId || !rating) {
      return NextResponse.json({ error: 'chatLogId and rating are required' }, { status: 400 });
    }

    if (rating !== 1 && rating !== 2) {
      return NextResponse.json({ error: 'Rating must be 1 (thumbs down) or 2 (thumbs up)' }, { status: 400 });
    }

    // Check if chat log exists
    const chatLog = await db.chatLog.findUnique({
      where: { id: chatLogId }
    });

    if (!chatLog) {
      return NextResponse.json({ error: 'Chat log not found' }, { status: 404 });
    }

    // Create feedback
    const feedback = await db.feedback.create({
      data: {
        chatLogId,
        rating,
        comment: comment || null
      }
    });

    return NextResponse.json({ success: true, feedbackId: feedback.id });

  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}