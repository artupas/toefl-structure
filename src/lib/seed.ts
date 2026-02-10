import { initDb } from './db';
import { toeflQuestions100 } from './questions100';

export function seedQuestions() {
  const db = initDb();
  
  // Check if questions already exist
  const count = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
  
  if (count.count > 0) {
    console.log(`Questions already seeded (${count.count} questions in database)`);
    return;
  }

  // Original 10 questions + 100 new questions = 110 total
  const originalQuestions = [
    {
      question: 'The professor said that the final exam ______ on Friday.',
      option_a: 'is',
      option_b: 'will be',
      option_c: 'would be',
      option_d: 'was being',
      correct_answer: 'C',
      explanation: 'When the main verb is in the past tense (said), the subordinate clause should also use a past tense form. "Would be" is the correct past form of "will be".',
      category: 'Tense Usage'
    },
    {
      question: 'Neither the students nor the teacher ______ happy with the results.',
      option_a: 'was',
      option_b: 'were',
      option_c: 'are',
      option_d: 'have been',
      correct_answer: 'A',
      explanation: 'With "neither...nor" constructions, the verb agrees with the nearest subject. Here "teacher" is singular, so we use "was".',
      category: 'Subject-Verb Agreement'
    },
    {
      question: 'If I ______ you, I would accept the offer.',
      option_a: 'am',
      option_b: 'was',
      option_c: 'were',
      option_d: 'be',
      correct_answer: 'C',
      explanation: 'In unreal conditional sentences (Type 2), we use "were" for all subjects, including "I".',
      category: 'Conditional Sentences'
    },
    {
      question: 'The book ______ on the table belongs to my sister.',
      option_a: 'lay',
      option_b: 'laid',
      option_c: 'lying',
      option_d: 'lain',
      correct_answer: 'C',
      explanation: '"Lying" is the present participle form used to describe the book\'s current state of being on the table.',
      category: 'Verb Forms'
    },
    {
      question: 'She ______ to the party if she had known about it.',
      option_a: 'would come',
      option_b: 'would have come',
      option_c: 'will come',
      option_d: 'comes',
      correct_answer: 'B',
      explanation: 'This is a Type 3 conditional (unreal past). The structure is: If + past perfect, would have + past participle.',
      category: 'Conditional Sentences'
    },
    {
      question: 'The company has ______ than 500 employees.',
      option_a: 'less',
      option_b: 'fewer',
      option_c: 'few',
      option_d: 'little',
      correct_answer: 'B',
      explanation: '"Fewer" is used with countable nouns (employees). "Less" is used with uncountable nouns.',
      category: 'Word Choice'
    },
    {
      question: 'By the time we arrived, the movie ______.',
      option_a: 'already started',
      option_b: 'has already started',
      option_c: 'had already started',
      option_d: 'was already starting',
      correct_answer: 'C',
      explanation: 'When one past action happens before another past action, we use past perfect (had + past participle) for the earlier action.',
      category: 'Tense Usage'
    },
    {
      question: 'I prefer coffee ______ tea.',
      option_a: 'than',
      option_b: 'over',
      option_c: 'to',
      option_d: 'against',
      correct_answer: 'C',
      explanation: 'The correct structure is "prefer X to Y".',
      category: 'Word Choice'
    },
    {
      question: 'The more you practice, ______ you will become.',
      option_a: 'the more fluent',
      option_b: 'more fluent',
      option_c: 'the most fluent',
      option_d: 'fluently',
      correct_answer: 'A',
      explanation: 'The structure "the + comparative, the + comparative" is used to show proportional increase.',
      category: 'Comparisons'
    },
    {
      question: 'Not only ______ late, but he also forgot his homework.',
      option_a: 'he arrived',
      option_b: 'he did arrive',
      option_c: 'did he arrive',
      option_d: 'arrived he',
      correct_answer: 'C',
      explanation: 'When a sentence begins with "Not only," we use inversion (auxiliary verb + subject + main verb).',
      category: 'Inversion'
    }
  ];

  // Combine original and new questions
  const questions = [...originalQuestions, ...toeflQuestions100];

  const insert = db.prepare(`
    INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(
        item.question,
        item.option_a,
        item.option_b,
        item.option_c,
        item.option_d,
        item.correct_answer,
        item.explanation,
        item.category || 'General'
      );
    }
  });

  insertMany(questions);
  console.log(`Seeded ${questions.length} questions`);
}
