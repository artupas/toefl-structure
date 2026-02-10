import { NextRequest, NextResponse } from 'next/server';
import { getDb, Question } from '@/lib/db';
import { seedQuestions } from '@/lib/seed';

export async function GET() {
  try {
    // Initialize and seed if needed
    seedQuestions();
    
    const db = getDb();
    const questions = db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT 20').all() as Question[];
    
    // Remove correct_answer from response for client
    const questionsWithoutAnswers = questions.map((q) => ({
      id: q.id,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      category: q.category,
      created_at: q.created_at
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: questionsWithoutAnswers,
      total: questions.length 
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, option_a, option_b, option_c, option_d, correct_answer, explanation } = body;
    
    if (!question || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(question, option_a, option_b, option_c, option_d, correct_answer, explanation || null);
    
    return NextResponse.json({ 
      success: true, 
      data: { id: result.lastInsertRowid } 
    });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
