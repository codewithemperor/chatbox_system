import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

interface FAQMatch {
  faq: any;
  score: number;
  reasons: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Message and sessionId are required' }, { status: 400 });
    }

    console.log('Processing message:', message);
    
    // Step 1: Try to find good match in database first
    const dbResponse = await findDatabaseResponse(message);
    
    if (dbResponse.score >= 3) {
      console.log('Using database response with score:', dbResponse.score);
      return await createChatLogAndRespond(message, sessionId, dbResponse.response, dbResponse.itemId, dbResponse.itemType);
    }

    // Step 2: If no good database match, use AI agent
    console.log('No good database match found, using AI agent');
    try {
      const aiResponse = await getAIResponse(message);
      if (aiResponse) {
        console.log('AI response generated successfully');
        return await createChatLogAndRespond(message, sessionId, aiResponse, null, null);
      }
    } catch (aiError) {
      console.error('AI agent failed:', aiError);
    }

    // Step 3: Final fallback - honest response
    const fallbackResponse = "I don't have specific information about that topic in my knowledge base. I can only answer questions based on the COM1111 course materials that have been uploaded to the system. \n\nYou can try asking about:\n• Programming basics\n• Algorithms and data structures\n• Computer architecture\n• Operating systems\n• Networking\n• Software development\n• Database systems\n\nIf you need information about a specific topic that's not covered, please ask your instructor or check the course materials.";
    
    console.log('Using fallback response');
    return await createChatLogAndRespond(message, sessionId, fallbackResponse, null, null);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function findDatabaseResponse(message: string): Promise<{response: string, score: number, itemId: string | null, itemType: 'faq' | 'note' | null}> {
  const lowerMessage = message.toLowerCase().trim();
  
  // Get all FAQs with their topics and notes
  const [faqs, notes] = await Promise.all([
    db.fAQ.findMany({
      include: {
        topic: true
      }
    }),
    db.note.findMany({
      include: {
        topic: true
      }
    })
  ]);

  console.log(`Found ${faqs.length} FAQs and ${notes.length} notes`);

  // Find best matches from FAQs
  const faqMatches = findBestMatches(lowerMessage, faqs, 'faq');
  
  // Find best matches from Notes
  const noteMatches = findBestMatches(lowerMessage, notes, 'note');

  // Combine and sort all matches
  const allMatches = [...faqMatches, ...noteMatches].sort((a, b) => b.score - a.score);

  console.log(`Found ${allMatches.length} total matches, best score: ${allMatches.length > 0 ? allMatches[0].score : 0}`);

  if (allMatches.length > 0 && allMatches[0].score >= 3) {
    const bestMatch = allMatches[0];
    let response: string;
    
    if (bestMatch.faq.question) {
      response = bestMatch.faq.answer;
    } else {
      response = bestMatch.faq.content;
    }
    
    console.log(`Using database response: ${response.substring(0, 100)}...`);
    
    return {
      response,
      score: bestMatch.score,
      itemId: bestMatch.faq.id,
      itemType: bestMatch.faq.question ? 'faq' : 'note'
    };
  }

  return {
    response: '',
    score: 0,
    itemId: null,
    itemType: null
  };
}

async function getAIResponse(userMessage: string): Promise<string | null> {
  try {
    console.log('Attempting AI response for:', userMessage);
    
    const zai = await ZAI.create();

    // Get some context from database to inform the AI
    const [faqs, notes] = await Promise.all([
      db.fAQ.findMany({ take: 5 }), // Get first 5 FAQs for context
      db.note.findMany({ take: 3 })  // Get first 3 notes for context
    ]);

    const context = faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');
    const noteContext = notes.map(note => `Topic: ${note.title}\nContent: ${note.content.substring(0, 150)}...`).join('\n\n');

    const systemPrompt = `You are a COM1111 Introduction to Computer Science teaching assistant. Your goal is to help students learn computer science concepts.

IMPORTANT GUIDELINES:
1. ONLY answer questions that are related to computer science fundamentals, programming, algorithms, data structures, computer architecture, operating systems, networking, or software development.
2. If the question is not related to computer science, politely explain that you can only help with computer science topics.
3. Keep your answers educational, clear, and concise.
4. If you're not sure about something, acknowledge the limitations of your knowledge.
5. Never make up facts or information that could be misleading.

AVAILABLE COURSE CONTEXT (use this to inform your responses):
FAQs:
${context}

Notes:
${noteContext}

Student's question: ${userMessage}

Provide a helpful, educational response:`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0]?.message?.content;
    console.log('AI response received:', aiResponse?.substring(0, 100) + '...');
    
    return aiResponse || null;

  } catch (error) {
    console.error('AI generation error:', error);
    return null;
  }
}

function findBestMatches(message: string, items: any[], type: 'faq' | 'note'): FAQMatch[] {
  const matches: FAQMatch[] = [];

  for (const item of items) {
    let score = 0;
    const reasons: string[] = [];

    // Get text content to search in
    const searchText = type === 'faq' ? item.question : item.title;
    const answerContent = type === 'faq' ? item.answer : item.content;
    const keywords = type === 'faq' ? JSON.parse(item.keywords || '[]') : JSON.parse(item.keywords || '[]');

    // 1. Check for exact keyword matches (highest weight)
    for (const keyword of keywords) {
      if (keyword.length > 2 && message.includes(keyword.toLowerCase())) {
        score += 5;
        reasons.push(`Keyword match: "${keyword}"`);
      }
    }

    // 2. Check for topic matches
    if (item.topic && message.includes(item.topic.name.toLowerCase())) {
      score += 4;
      reasons.push(`Topic match: "${item.topic.name}"`);
    }

    // 3. Check for words in the question/title (medium weight)
    const searchWords = searchText.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    for (const word of searchWords) {
      if (message.includes(word)) {
        score += 2;
        reasons.push(`Title word match: "${word}"`);
      }
    }

    // 4. Check for words in the answer/content (low weight)
    const answerWords = answerContent.toLowerCase().split(/\s+/).filter(word => word.length > 4);
    let answerWordMatches = 0;
    for (const word of answerWords) {
      if (message.includes(word)) {
        answerWordMatches++;
      }
    }
    if (answerWordMatches > 0) {
      score += Math.min(answerWordMatches * 0.5, 3); // Cap at 3 points
      reasons.push(`Content word matches: ${answerWordMatches}`);
    }

    // 5. Check for partial matches and related terms
    const relatedTerms = getRelatedTerms(message);
    for (const term of relatedTerms) {
      if (searchText.toLowerCase().includes(term) || answerContent.toLowerCase().includes(term)) {
        score += 1;
        reasons.push(`Related term match: "${term}"`);
      }
    }

    if (score > 0) {
      matches.push({
        faq: item,
        score,
        reasons
      });
    }
  }

  return matches;
}

function getRelatedTerms(message: string): string[] {
  const termMap: Record<string, string[]> = {
    'algorithm': ['algo', 'sorting', 'searching', 'complexity', 'efficiency'],
    'data structure': ['array', 'list', 'stack', 'queue', 'tree', 'graph', 'hash'],
    'programming': ['code', 'coding', 'function', 'variable', 'loop', 'conditional'],
    'computer': ['cpu', 'memory', 'hardware', 'processor', 'architecture'],
    'operating system': ['os', 'windows', 'linux', 'process', 'thread'],
    'network': ['networking', 'protocol', 'tcp', 'ip', 'internet', 'lan'],
    'database': ['sql', 'table', 'query', 'index', 'relation'],
    'software': ['application', 'program', 'development', 'lifecycle'],
    'hardware': ['cpu', 'ram', 'rom', 'storage', 'input', 'output']
  };

  const relatedTerms: string[] = [];
  for (const [key, terms] of Object.entries(termMap)) {
    if (message.includes(key)) {
      relatedTerms.push(...terms);
    }
  }

  return relatedTerms;
}

async function createChatLogAndRespond(message: string, sessionId: string, response: string, itemId: string | null, itemType: 'faq' | 'note' | null) {
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

  // Create chat log
  const chatLog = await db.chatLog.create({
    data: {
      sessionId: chatSession.sessionId,
      userQuery: message,
      botResponse: response,
      faqId: itemType === 'faq' ? itemId : null,
      noteId: itemType === 'note' ? itemId : null
    },
    include: {
      faq: {
        include: {
          topic: true
        }
      },
      note: {
        include: {
          topic: true
        }
      }
    }
  });

  const topic = chatLog.faq?.topic?.name || chatLog.note?.topic?.name || null;

  return NextResponse.json({
    success: true,
    response: chatLog.botResponse,
    chatLogId: chatLog.id,
    topic
  });
}