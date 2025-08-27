import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get or create session
    let session;
    if (sessionId) {
      session = await db.chatSession.findUnique({
        where: { sessionId }
      });
    }

    if (!session) {
      const newSessionId = uuidv4();
      session = await db.chatSession.create({
        data: {
          sessionId: newSessionId,
          userAgent: request.headers.get('user-agent') || undefined,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
        }
      });
    }

    // Find relevant content from both FAQs and Notes
    const [faqs, notes] = await Promise.all([
      db.fAQ.findMany({
        include: {
          topic: true
        }
      }),
      db.note.findMany({
        where: { isActive: true },
        include: {
          topic: true
        }
      })
    ]);

    let bestMatch = null;
    let bestScore = 0;
    let matchType = 'none';
    const messageLower = message.toLowerCase();

    // Search through FAQs
    for (const faq of faqs) {
      const keywords = JSON.parse(faq.keywords || '[]');
      let score = 0;
      
      // Check if any keywords match
      for (const keyword of keywords) {
        if (messageLower.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }

      // Check if question contains similar words
      const faqQuestionLower = faq.question.toLowerCase();
      const messageWords = messageLower.split(' ');
      const faqWords = faqQuestionLower.split(' ');
      
      for (const messageWord of messageWords) {
        if (messageWord.length > 3 && faqWords.includes(messageWord)) {
          score += 0.5;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = { ...faq, type: 'faq' };
        matchType = 'faq';
      }
    }

    // Search through Notes
    for (const note of notes) {
      const keywords = JSON.parse(note.keywords || '[]');
      let score = 0;
      
      // Check if any keywords match
      for (const keyword of keywords) {
        if (messageLower.includes(keyword.toLowerCase())) {
          score += 1.5; // Notes have higher priority
        }
      }

      // Check if title matches
      const noteTitleLower = note.title.toLowerCase();
      if (noteTitleLower.includes(messageLower)) {
        score += 2;
      }

      // Check if content contains relevant words
      const noteContentLower = note.content.toLowerCase();
      const messageWords = messageLower.split(' ');
      
      for (const messageWord of messageWords) {
        if (messageWord.length > 3 && noteContentLower.includes(messageWord)) {
          score += 0.3;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = { ...note, type: 'note' };
        matchType = 'note';
      }
    }

    // Generate response
    let response;
    let matchedId = null;
    let topic = null;

    if (bestMatch && bestScore > 0) {
      if (matchType === 'faq') {
        response = bestMatch.answer;
        matchedId = bestMatch.id;
      } else if (matchType === 'note') {
        response = `**${bestMatch.title}**\n\n${bestMatch.content}`;
        matchedId = bestMatch.id;
      }
      topic = bestMatch.topic;
    } else {
      // Fallback response when no match is found
      response = "I'm still learning about COM1111 concepts! I don't have a specific answer for your question. Could you try rephrasing it or ask your instructor for help? You can also try browsing the topics on the left side of the screen for more information.";
    }

    // Log the conversation
    const chatLogData: any = {
      sessionId: session.sessionId,
      userQuery: message,
      botResponse: response,
      timestamp: new Date()
    };

    if (matchType === 'faq' && matchedId) {
      chatLogData.faqId = matchedId;
    } else if (matchType === 'note' && matchedId) {
      chatLogData.noteId = matchedId;
    }

    const chatLog = await db.chatLog.create({
      data: chatLogData
    });

    return NextResponse.json({
      response,
      sessionId: session.sessionId,
      chatLogId: chatLog.id,
      topic: topic?.name || null,
      confidence: bestScore,
      matchType
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}