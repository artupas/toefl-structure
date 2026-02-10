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
    
    // Get all answers for this session with category info
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
        q.explanation,
        q.category
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.session_id = ?
      ORDER BY a.id
    `).all(id);
    
    // Calculate category statistics
    const categoryStats: Record<string, { total: number; correct: number; incorrect: number }> = {};
    
    for (const answer of answers as Array<{category?: string; is_correct: number}>) {
      const category = answer.category || 'Uncategorized';
      
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, correct: 0, incorrect: 0 };
      }
      
      categoryStats[category].total++;
      if (answer.is_correct) {
        categoryStats[category].correct++;
      } else {
        categoryStats[category].incorrect++;
      }
    }
    
    // Sort categories by incorrect count (most problematic first)
    const sortedCategories = Object.entries(categoryStats)
      .map(([name, stats]) => ({
        name,
        ...stats,
        accuracy: Math.round((stats.correct / stats.total) * 100)
      }))
      .sort((a, b) => b.incorrect - a.incorrect);
    
    // Generate personalized recommendations
    const recommendations: string[] = [];
    const weakCategories = sortedCategories.filter(c => c.accuracy < 70);
    
    if (weakCategories.length === 0) {
      recommendations.push("Great job! You performed well across all grammar categories.");
      recommendations.push("To maintain your skills, continue practicing with mixed question sets.");
    } else {
      recommendations.push(`Focus on improving your ${weakCategories[0].name} skills.`);
      
      if (weakCategories.length > 1) {
        const categoryNames = weakCategories.slice(1).map(c => c.name).join(', ');
        recommendations.push(`Also work on: ${categoryNames}.`);
      }
      
      // Add specific tips based on weak categories
      for (const cat of weakCategories.slice(0, 3)) {
        switch (cat.name) {
          case 'Subject-Verb Agreement':
            recommendations.push("Tip: Remember that singular subjects take singular verbs. Watch for tricky cases like 'neither', 'each', and collective nouns.");
            break;
          case 'Tense Usage':
            recommendations.push("Tip: Pay attention to time markers and context clues that indicate which tense to use.");
            break;
          case 'Conditional Sentences':
            recommendations.push("Tip: Practice the three main conditional types and their structures. Remember Type 2 uses 'were' for all subjects.");
            break;
          case 'Verb Forms':
            recommendations.push("Tip: Learn which verbs are followed by gerunds (-ing) and which by infinitives (to + verb).");
            break;
          case 'Parallel Structure':
            recommendations.push("Tip: Items in a series or after correlative conjunctions must have the same grammatical form.");
            break;
          case 'Comparisons':
            recommendations.push("Tip: Remember irregular forms (good/better/best, bad/worse/worst) and when to use 'more/most'.");
            break;
          case 'Word Choice':
            recommendations.push("Tip: Study commonly confused words and preposition usage (time expressions, adjective vs. adverb).");
            break;
          case 'Relative Clauses':
            recommendations.push("Tip: 'Who' for people, 'which' for things, 'whose' for possession.");
            break;
          case 'Inversion':
            recommendations.push("Tip: After negative adverbs at the beginning (hardly, seldom, never), use auxiliary + subject + main verb.");
            break;
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        session,
        answers,
        categoryAnalysis: sortedCategories,
        recommendations
      }
    });
  } catch (error) {
    console.error('Error fetching test session analysis:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test session analysis' },
      { status: 500 }
    );
  }
}
