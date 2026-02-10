import { NextRequest, NextResponse } from 'next/server';
import { getDb, Question } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers, sessionId, userName } = body;
    
    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, error: 'Invalid answers format' },
        { status: 400 }
      );
    }
    
    const db = getDb();
    let correctCount = 0;
    const results = [];
    
    // Get or create session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const sessionResult = db.prepare(`
        INSERT INTO test_sessions (user_name, started_at)
        VALUES (?, datetime('now'))
      `).run(userName || null);
      currentSessionId = sessionResult.lastInsertRowid;
    }
    
    for (const answer of answers) {
      const { questionId, selectedAnswer } = answer;
      
      const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId) as Question;
      
      if (!question) {
        continue;
      }
      
      const isCorrect = question.correct_answer === selectedAnswer;
      if (isCorrect) {
        correctCount++;
      }
      
      // Log each answer (convert boolean to integer for SQLite)
      db.prepare(`
        INSERT INTO answers (session_id, question_id, selected_answer, is_correct)
        VALUES (?, ?, ?, ?)
      `).run(currentSessionId, questionId, selectedAnswer, isCorrect ? 1 : 0);
      
      results.push({
        questionId,
        selectedAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        explanation: question.explanation
      });
    }
    
    const totalQuestions = answers.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    
    // Update session with results
    db.prepare(`
      UPDATE test_sessions 
      SET ended_at = datetime('now'), 
          score = ?, 
          total_questions = ?, 
          correct_answers = ?
      WHERE id = ?
    `).run(score, totalQuestions, correctCount, currentSessionId);
    
    return NextResponse.json({
      success: true,
      data: {
        sessionId: currentSessionId,
        score,
        totalQuestions,
        correctCount,
        results
      }
    });
  } catch (error) {
    console.error('Error submitting answers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit answers' },
      { status: 500 }
    );
  }
}
