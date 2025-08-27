import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const topics = await db.topic.findMany({
      include: {
        _count: {
          select: {
            faqs: true,
            quizzes: true,
            notes: true
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

export async function POST(request: NextRequest) {
  try {
    const { name, description, icon, color } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Topic name is required' }, { status: 400 });
    }

    // Check if topic with this name already exists
    const existingTopic = await db.topic.findUnique({
      where: { name }
    });

    if (existingTopic) {
      return NextResponse.json({ error: 'Topic with this name already exists' }, { status: 400 });
    }

    const topic = await db.topic.create({
      data: {
        name,
        description: description || null,
        icon: icon || null,
        color: color || null
      },
      include: {
        _count: {
          select: {
            faqs: true,
            quizzes: true,
            notes: true
          }
        }
      }
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Create topic error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, description, icon, color } = await request.json();

    if (!id || !name) {
      return NextResponse.json({ error: 'Topic ID and name are required' }, { status: 400 });
    }

    // Check if topic exists
    const existingTopic = await db.topic.findUnique({
      where: { id }
    });

    if (!existingTopic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Check if another topic with this name already exists
    const nameConflict = await db.topic.findFirst({
      where: {
        name,
        id: { not: id }
      }
    });

    if (nameConflict) {
      return NextResponse.json({ error: 'Topic with this name already exists' }, { status: 400 });
    }

    const topic = await db.topic.update({
      where: { id },
      data: {
        name,
        description: description || null,
        icon: icon || null,
        color: color || null
      },
      include: {
        _count: {
          select: {
            faqs: true,
            quizzes: true,
            notes: true
          }
        }
      }
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Update topic error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    // Check if topic exists
    const existingTopic = await db.topic.findUnique({
      where: { id }
    });

    if (!existingTopic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    await db.topic.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete topic error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}