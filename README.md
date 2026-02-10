# TOEFL Structure Test Application

Aplikasi tes TOEFL bagian Structure berbasis Next.js dan SQLite.

## Fitur

- **Tes Structure Interaktif**: 10 soal TOEFL Structure dengan navigasi yang mudah
- **Timer**: Waktu pengerjaan 20 menit dengan visual warning saat waktu hampir habis
- **Review Jawaban**: Lihat pembahasan dan penjelasan untuk setiap soal setelah selesai
- **Scoring**: Penilaian otomatis dengan persentase skor
- **SQLite Database**: Database lokal untuk menyimpan soal dan hasil tes

## Struktur Project

```
toefl-structure/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── questions/
│   │   │       ├── route.ts          # API untuk mengambil dan membuat soal
│   │   │       └── submit/
│   │   │           └── route.ts      # API untuk submit jawaban
│   │   ├── page.tsx                  # Halaman utama aplikasi
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Timer.tsx                 # Komponen timer countdown
│   │   ├── QuestionCard.tsx          # Komponen kartu soal
│   │   ├── ProgressBar.tsx           # Komponen progress bar
│   │   └── ResultModal.tsx           # Komponen modal hasil tes
│   └── lib/
│       ├── db.ts                     # Database utilities dan koneksi SQLite
│       └── seed.ts                   # Data soal awal
├── data/
│   └── toefl.db                      # File database SQLite
└── package.json
```

## Cara Menjalankan

1. **Install dependencies**:
   ```bash
   cd toefl-structure
   npm install
   ```

2. **Jalankan development server**:
   ```bash
   npm run dev
   ```

3. **Buka browser**:
   Akses http://localhost:3000

## API Endpoints

- `GET /api/questions` - Mengambil daftar soal (tanpa jawaban)
- `POST /api/questions` - Membuat soal baru
- `POST /api/questions/submit` - Submit jawaban dan mendapatkan hasil

## Database Schema

### Tabel Questions
- id (INTEGER PRIMARY KEY)
- question (TEXT)
- option_a, option_b, option_c, option_d (TEXT)
- correct_answer (TEXT)
- explanation (TEXT)
- created_at (DATETIME)

### Tabel Test Sessions
- id (INTEGER PRIMARY KEY)
- user_name (TEXT)
- started_at, ended_at (DATETIME)
- score, total_questions, correct_answers (INTEGER)

### Tabel Answers
- id (INTEGER PRIMARY KEY)
- session_id (INTEGER)
- question_id (INTEGER)
- selected_answer (TEXT)
- is_correct (BOOLEAN)

## Teknologi

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **SQLite** - Database lokal
- **better-sqlite3** - SQLite driver untuk Node.js

## Deployment on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# toefl-structure
