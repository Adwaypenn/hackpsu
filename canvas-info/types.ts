// ─────────────────────────────────────────────
// Canvas Data Types
// These mirror the shape of real Canvas API responses.
// When integration is live, replace mock files with API fetches
// that return data conforming to these interfaces.
// ─────────────────────────────────────────────

export interface CanvasCourse {
  id: string;
  name: string;
  courseCode: string;       // e.g. "CMPSC 473"
  instructor: string;
  credits: number;
  term: string;             // e.g. "Spring 2025"
  currentGrade: string;     // Letter grade: "A", "B+", etc.
  currentScore: number;     // Numeric score 0–100
}

export interface CanvasAssignment {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;          // ISO 8601 date string
  pointsPossible: number;
  score: number | null;     // null = not yet graded
  submissionType: 'online_upload' | 'online_text_entry' | 'paper' | 'exam';
  status: 'graded' | 'submitted' | 'missing' | 'upcoming';
}

export interface CanvasExam {
  id: string;
  courseId: string;
  title: string;
  date: string;             // ISO 8601 date string
  location: string;
  durationMinutes: number;
  topics: string[];         // Topics covered
  readinessPercent: number; // Manually estimated or computed
}

export interface CanvasProfessor {
  id: string;
  name: string;
  courseId: string;
  email: string;
  officeHours: string;
  avgGradeGiven: string;    // Letter grade average
  difficultyRating: number; // Out of 5
  notes: string;
}

export interface CanvasAnnouncement {
  id: string;
  courseId: string;
  title: string;
  body: string;
  postedAt: string;         // ISO 8601 date string
}

export interface CanvasStressLog {
  date: string;             // ISO 8601 date string (YYYY-MM-DD)
  level: 'Low' | 'Medium' | 'High';
}
