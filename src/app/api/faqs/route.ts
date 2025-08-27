import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const topicId = searchParams.get('topicId') || '';

    // Build where clause for filtering
    const where: any = {};
    
    if (topicId) {
      where.topicId = topicId;
    }

    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
        { keywords: { contains: search, mode: 'insensitive' } }
      ];
    }

    const faqs = await db.fAQ.findMany({
      where,
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error('FAQs API GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question, answer, keywords, topicId } = await request.json();

    if (!question || !answer || !topicId) {
      return NextResponse.json({ 
        error: 'Question, answer, and topic ID are required' 
      }, { status: 400 });
    }

    // Validate that topic exists
    const topic = await db.topic.findUnique({
      where: { id: topicId }
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Parse keywords if it's a string, otherwise use as-is
    let keywordsJson = keywords;
    if (typeof keywords === 'string') {
      try {
        // If it's already a JSON string, use it
        JSON.parse(keywords);
      } catch {
        // If it's a comma-separated string, convert to JSON array
        const keywordsArray = keywords
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0);
        keywordsJson = JSON.stringify(keywordsArray);
      }
    }

    const faq = await db.fAQ.create({
      data: {
        question,
        answer,
        keywords: keywordsJson,
        topicId
      },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error('Create FAQ error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, question, answer, keywords, topicId } = await request.json();

    if (!id || !question || !answer || !topicId) {
      return NextResponse.json({ 
        error: 'ID, question, answer, and topic ID are required' 
      }, { status: 400 });
    }

    // Check if FAQ exists
    const existingFAQ = await db.fAQ.findUnique({
      where: { id }
    });

    if (!existingFAQ) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    }

    // Validate that topic exists
    const topic = await db.topic.findUnique({
      where: { id: topicId }
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Parse keywords if it's a string, otherwise use as-is
    let keywordsJson = keywords;
    if (typeof keywords === 'string') {
      try {
        // If it's already a JSON string, use it
        JSON.parse(keywords);
      } catch {
        // If it's a comma-separated string, convert to JSON array
        const keywordsArray = keywords
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0);
        keywordsJson = JSON.stringify(keywordsArray);
      }
    }

    const faq = await db.fAQ.update({
      where: { id },
      data: {
        question,
        answer,
        keywords: keywordsJson,
        topicId
      },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error('Update FAQ error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 });
    }

    // Check if FAQ exists
    const existingFAQ = await db.fAQ.findUnique({
      where: { id }
    });

    if (!existingFAQ) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    }

    await db.fAQ.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}