import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName } = body;
    
    const db = getDb();
    
    // Create a new test session
    const result = db.prepare(`
      INSERT INTO test_sessions (user_name, started_at)
      VALUES (?, datetime('now'))
    `).run(userName || null);
    
    return NextResponse.json({
      success: true,
      data: {
        sessionId: result.lastInsertRowid
      }
    });
  } catch (error) {
    console.error('Error creating test session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create test session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = getDb();
    
    // Get all completed test sessions with their results
    const sessions = db.prepare(`
      SELECT 
        ts.id,
        ts.user_name,
        ts.started_at,
        ts.ended_at,
        ts.score,
        ts.total_questions,
        ts.correct_answers
      FROM test_sessions ts
      WHERE ts.ended_at IS NOT NULL
      ORDER BY ts.ended_at DESC
    `).all();
    
    return NextResponse.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching test sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test sessions' },
      { status: 500 }
    );
  }
}
