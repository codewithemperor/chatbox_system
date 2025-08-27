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
    const search = searchParams.get('search') || '';
    const topicId = searchParams.get('topicId') || '';

    // Build where clause for filtering
    const where: any = {};
    
    if (topicId) {
      where.topicId = topicId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { keywords: { contains: search, mode: 'insensitive' } }
      ];
    }

    const notes = await db.note.findMany({
      where,
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        },
        admin: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Notes API GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminId = await getAdminId(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, keywords, topicId, isActive = true } = await request.json();

    if (!title || !content || !topicId) {
      return NextResponse.json({ 
        error: 'Title, content, and topic ID are required' 
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

    const note = await db.note.create({
      data: {
        title,
        content,
        keywords: keywordsJson,
        topicId,
        adminId,
        isActive
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
        admin: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminId = await getAdminId(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, title, content, keywords, topicId, isActive } = await request.json();

    if (!id || !title || !content || !topicId) {
      return NextResponse.json({ 
        error: 'ID, title, content, and topic ID are required' 
      }, { status: 400 });
    }

    // Check if note exists and belongs to admin
    const existingNote = await db.note.findFirst({
      where: { 
        id,
        adminId 
      }
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found or access denied' }, { status: 404 });
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

    const note = await db.note.update({
      where: { id },
      data: {
        title,
        content,
        keywords: keywordsJson,
        topicId,
        isActive
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
        admin: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Update note error:', error);
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
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    // Check if note exists and belongs to admin
    const existingNote = await db.note.findFirst({
      where: { 
        id,
        adminId 
      }
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found or access denied' }, { status: 404 });
    }

    await db.note.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}