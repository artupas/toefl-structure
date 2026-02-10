import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const db = getDb();
    
    // Get session details
    const session = db.prepare(`
      SELECT 
        ts.id,
        ts.user_name,
        ts.started_at,
        ts.ended_at,
        ts.score,
        ts.total_questions,
        ts.correct_answers
      FROM test_sessions ts
      WHERE ts.id = ?
    `).get(id);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Get all answers for this session
    const answers = db.prepare(`
      SELECT 
        a.id,
        a.question_id,
        a.selected_answer,
        a.is_correct,
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_answer,
        q.explanation
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.session_id = ?
      ORDER BY a.id
    `).all(id);
    
    return NextResponse.json({
      success: true,
      data: {
        session,
        answers
      }
    });
  } catch (error) {
    console.error('Error fetching test session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test session' },
      { status: 500 }
    );
  }
}
