import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

interface FAQMatch {
  faq: any;
  score: number;
  reasons: string[];
}

interface KeywordPattern {
  keywordType: 'what-is' | 'explain' | 'define';
  targetTerm: string;
  originalPattern: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Message and sessionId are required' }, { status: 400 });
    }

    console.log('Processing message:', message);
    
    // Check for keyword detection patterns
    const keywordCheck = checkForKeywordPattern(message);
    
    if (keywordCheck) {
      console.log('Keyword pattern detected:', keywordCheck);
      
      // Try to find the target term in database
      const dbResponse = await findDatabaseResponseForTerm(keywordCheck.targetTerm);
      
      if (dbResponse.score >= 4) { // Increased threshold for keyword patterns
        console.log('Found database match for keyword pattern with score:', dbResponse.score);
        return await createChatLogAndRespond(message, sessionId, dbResponse.response, dbResponse.itemId, dbResponse.itemType);
      } else {
        console.log('No database match found for keyword pattern, using AI fallback');
        
        // Get AI explanation for the specific term
        try {
          const aiExplanation = await getAIResponseForTerm(keywordCheck.targetTerm, keywordCheck.keywordType);
          if (aiExplanation) {
            return await createChatLogAndRespond(message, sessionId, aiExplanation, null, null);
          }
        } catch (aiError) {
          console.error('AI explanation failed:', aiError);
        }
        
        // Fallback if AI fails - get topics from database
        const topics = await db.topic.findMany({
          orderBy: { name: 'asc' }
        });
        
        const topicsList = topics.length > 0 
          ? topics.map(topic => `• ${topic.name}`).join('\n')
          : '• Programming basics\n• Algorithms and data structures\n• Computer architecture\n• Operating systems\n• Networking\n• Software development\n• Database systems';
        
        const fallbackResponse = `I don't have specific information about "${keywordCheck.targetTerm}" in my knowledge base. This topic might not be covered in the COM1111 course materials. You can try asking about:\n${topicsList}`;
        
        return await createChatLogAndRespond(message, sessionId, fallbackResponse, null, null);
      }
    }
    
    // Step 1: Try to find good match in database first (for regular queries)
    const dbResponse = await findDatabaseResponse(message);
    
    if (dbResponse.score >= 5) { // Increased threshold for regular queries
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

    // Step 3: Final fallback - honest response with dynamic topics
    const topics = await db.topic.findMany({
      orderBy: { name: 'asc' }
    });
    
    const topicsList = topics.length > 0 
      ? topics.map(topic => `• ${topic.name}`).join('\n')
      : '• Programming basics\n• Algorithms and data structures\n• Computer architecture\n• Operating systems\n• Networking\n• Software development\n• Database systems';
    
    const fallbackResponse = `I don't have specific information about that topic in my knowledge base. I can only answer questions based on the COM1111 course materials that have been uploaded to the system. \n\nYou can try asking about:\n${topicsList}\n\nIf you need information about a specific topic that's not covered, please ask your instructor or check the course materials.`;
    
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

  if (allMatches.length > 0 && allMatches[0].score >= 5) {
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

    // 1. Check for exact phrase matches (highest weight)
    if (searchText.toLowerCase().includes(message)) {
      score += 10;
      reasons.push(`Exact phrase match in title`);
    }

    // 2. Check for exact keyword matches (high weight)
    for (const keyword of keywords) {
      if (keyword.length > 2 && message.includes(keyword.toLowerCase())) {
        score += 6;
        reasons.push(`Exact keyword match: "${keyword}"`);
      }
    }

    // 3. Check for topic matches (medium-high weight)
    if (item.topic && message.includes(item.topic.name.toLowerCase())) {
      score += 5;
      reasons.push(`Topic match: "${item.topic.name}"`);
    }

    // 4. Check for question/title word matches with semantic filtering
    const searchWords = searchText.toLowerCase().split(/\s+/).filter(word => 
      word.length > 4 && // Only longer words
      !isCommonWord(word) // Exclude common words
    );
    
    let significantWordMatches = 0;
    for (const word of searchWords) {
      if (message.includes(word)) {
        significantWordMatches++;
        reasons.push(`Significant word match: "${word}"`);
      }
    }
    
    // Only give points if multiple significant words match
    if (significantWordMatches >= 2) {
      score += significantWordMatches * 2;
    } else if (significantWordMatches === 1 && searchWords.length === 1) {
      // If it's a single-word question/title and it matches, give some points
      score += 3;
    }

    // 5. Check for semantic similarity in main question words
    const questionMainWords = extractMainWords(message);
    const titleMainWords = extractMainWords(searchText);
    
    const semanticOverlap = questionMainWords.filter(word => 
      titleMainWords.includes(word)
    ).length;
    
    if (semanticOverlap > 0 && questionMainWords.length > 0) {
      const semanticScore = (semanticOverlap / questionMainWords.length) * 4;
      score += semanticScore;
      reasons.push(`Semantic overlap: ${semanticOverlap}/${questionMainWords.length} main words`);
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

// Helper function to extract main words (excluding common words and short words)
function extractMainWords(text: string): string[] {
  return text.toLowerCase()
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !isCommonWord(word) &&
      !/^(what|how|when|where|why|which|who|is|are|was|were|do|does|did|can|could|will|would|should|shall)$/.test(word)
    );
}

// Helper function to identify common words that shouldn't be used for matching
function isCommonWord(word: string): boolean {
  const commonWords = [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'doesn', 'each', 'few', 'got', 'let', 'man', 'men', 'put', 'say', 'she', 'too', 'use', 'that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were', 'what', 'work'
  ];
  
  return commonWords.includes(word.toLowerCase());
}

function findBestMatchesForTerm(targetTerm: string, items: any[], type: 'faq' | 'note'): FAQMatch[] {
  const matches: FAQMatch[] = [];

  for (const item of items) {
    let score = 0;
    const reasons: string[] = [];

    // Get text content to search in
    const searchText = type === 'faq' ? item.question : item.title;
    const answerContent = type === 'faq' ? item.answer : item.content;
    const keywords = type === 'faq' ? JSON.parse(item.keywords || '[]') : JSON.parse(item.keywords || '[]');

    // 1. Check for exact term match as the main subject in title/question
    const titleWords = searchText.toLowerCase().split(/\s+/);
    if (titleWords.includes(targetTerm) && isMainSubject(targetTerm, searchText)) {
      score += 10;
      reasons.push(`Main subject match in title: "${targetTerm}"`);
    }

    // 2. Check for exact keyword matches where the term is actually the main topic
    for (const keyword of keywords) {
      if (keyword.toLowerCase() === targetTerm) {
        score += 8;
        reasons.push(`Exact keyword match: "${keyword}"`);
      }
    }

    // 3. Check if the target term is the primary focus of the content
    if (isPrimaryFocus(targetTerm, searchText, answerContent)) {
      score += 6;
      reasons.push(`Primary focus match for: "${targetTerm}"`);
    }

    // 4. Check for topic matches where the term matches the topic name
    if (item.topic && item.topic.name.toLowerCase() === targetTerm) {
      score += 7;
      reasons.push(`Exact topic match: "${item.topic.name}"`);
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

// Helper function to determine if a term is the main subject of a title/question
function isMainSubject(term: string, text: string): boolean {
  const lowerText = text.toLowerCase();
  const termIndex = lowerText.indexOf(term);
  
  if (termIndex === -1) return false;
  
  // Check if the term appears early in the title (first half)
  const isEarly = termIndex < lowerText.length / 2;
  
  // Check if it's preceded by defining words
  const definingWords = ['what', 'define', 'explain', 'about'];
  const wordsBeforeTerm = lowerText.substring(0, termIndex).split(/\s+/);
  const hasDefiningWord = definingWords.some(word => wordsBeforeTerm.includes(word));
  
  return isEarly || hasDefiningWord;
}

// Helper function to determine if a term is the primary focus of the content
function isPrimaryFocus(term: string, title: string, content: string): boolean {
  const termLower = term.toLowerCase();
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Count occurrences
  const titleOccurrences = (titleLower.match(new RegExp(termLower, 'g')) || []).length;
  const contentOccurrences = (contentLower.match(new RegExp(termLower, 'g')) || []).length;
  
  // Check if term appears in title and multiple times in content
  if (titleOccurrences > 0 && contentOccurrences >= 3) {
    return true;
  }
  
  // Check if term is one of the first few words in title
  const titleWords = titleLower.split(/\s+/);
  if (titleWords.length <= 3 && titleWords.includes(termLower)) {
    return true;
  }
  
  return false;
}

async function getAIResponseForTerm(targetTerm: string, keywordType: 'what-is' | 'explain' | 'define'): Promise<string | null> {
  try {
    console.log(`Getting AI response for term "${targetTerm}" with type "${keywordType}"`);
    
    const zai = await ZAI.create();

    // Get some context from database to inform the AI
    const [faqs, notes] = await Promise.all([
      db.fAQ.findMany({ take: 5 }), // Get first 5 FAQs for context
      db.note.findMany({ take: 3 })  // Get first 3 notes for context
    ]);

    const context = faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');
    const noteContext = notes.map(note => `Topic: ${note.title}\nContent: ${note.content.substring(0, 150)}...`).join('\n\n');

    let prompt = '';
    
    // Customize prompt based on keyword type
    switch (keywordType) {
      case 'what-is':
        prompt = `What is ${targetTerm}? Please provide a clear, concise definition in the context of computer science.`;
        break;
      case 'explain':
        prompt = `Explain ${targetTerm} in the context of computer science. Provide a detailed explanation including its importance and applications.`;
        break;
      case 'define':
        prompt = `Define ${targetTerm} in the context of computer science. Provide a precise definition and explain what this term means.`;
        break;
    }

    const systemPrompt = `You are a COM1111 Introduction to Computer Science teaching assistant. 

IMPORTANT GUIDELINES:
1. ONLY answer questions that are related to computer science fundamentals, programming, algorithms, data structures, computer architecture, operating systems, networking, or software development.
2. If the term is not related to computer science, politely explain that you can only help with computer science topics.
3. Keep your answers educational, clear, and concise (2-3 sentences maximum).
4. Focus specifically on the term being asked about - don't provide general information.
5. If you're not sure about something, acknowledge the limitations of your knowledge.

AVAILABLE COURSE CONTEXT:
${context}

${noteContext}`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    });

    const aiResponse = completion.choices[0]?.message?.content;
    console.log('AI response for term received:', aiResponse?.substring(0, 100) + '...');
    
    return aiResponse || null;

  } catch (error) {
    console.error('AI generation error for term:', error);
    return null;
  }
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

// Helper function to check for keyword patterns like "what is", "explain", "define"
function checkForKeywordPattern(message: string): KeywordPattern | null {
  const lowerMessage = message.toLowerCase().trim();
  
  // Pattern: "what is [term]?" or "what is a [term]?" or "what is an [term]?"
  const whatIsPattern = /^what\s+is\s+(?:a\s+|an\s+)?([^\?]+)(?:\?)?$/;
  const whatIsMatch = lowerMessage.match(whatIsPattern);
  
  if (whatIsMatch) {
    return {
      keywordType: 'what-is',
      targetTerm: whatIsMatch[1].trim(),
      originalPattern: message
    };
  }
  
  // Pattern: "explain [term]" or "explain what [term] is"
  const explainPattern = /^explain\s+(.+)$/;
  const explainMatch = lowerMessage.match(explainPattern);
  
  if (explainMatch) {
    let term = explainMatch[1].trim();
    // Clean up patterns like "what X is" to just "X"
    term = term.replace(/^what\s+(.+?)\s+is$/, '$1');
    return {
      keywordType: 'explain',
      targetTerm: term,
      originalPattern: message
    };
  }
  
  // Pattern: "define [term]"
  const definePattern = /^define\s+(.+)$/;
  const defineMatch = lowerMessage.match(definePattern);
  
  if (defineMatch) {
    return {
      keywordType: 'define',
      targetTerm: defineMatch[1].trim(),
      originalPattern: message
    };
  }
  
  return null;
}

// Helper function to find database response for a specific term
async function findDatabaseResponseForTerm(targetTerm: string): Promise<{response: string, score: number, itemId: string | null, itemType: 'faq' | 'note' | null}> {
  const lowerTargetTerm = targetTerm.toLowerCase().trim();
  
  // Get all FAQs and notes
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

  console.log(`Searching for term "${lowerTargetTerm}" in ${faqs.length} FAQs and ${notes.length} notes`);

  // Find best matches from FAQs
  const faqMatches = findBestMatchesForTerm(lowerTargetTerm, faqs, 'faq');
  
  // Find best matches from Notes
  const noteMatches = findBestMatchesForTerm(lowerTargetTerm, notes, 'note');

  // Combine and sort all matches
  const allMatches = [...faqMatches, ...noteMatches].sort((a, b) => b.score - a.score);

  console.log(`Found ${allMatches.length} total matches for term "${lowerTargetTerm}", best score: ${allMatches.length > 0 ? allMatches[0].score : 0}`);

  if (allMatches.length > 0 && allMatches[0].score >= 4) {
    const bestMatch = allMatches[0];
    let response: string;
    
    if (bestMatch.faq.question) {
      response = bestMatch.faq.answer;
    } else {
      response = bestMatch.faq.content;
    }
    
    console.log(`Using database response for term: ${response.substring(0, 100)}...`);
    
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