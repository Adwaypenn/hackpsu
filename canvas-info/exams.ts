import type { CanvasExam } from './types';

// SOURCE: Canvas → Calendar Events / Assignments (type=exam)
// Live endpoint: GET /api/v1/calendar_events?type=assignment&context_codes[]=course_:id
const exams: CanvasExam[] = [
  {
    id: 'exam_001',
    courseId: 'course_001',
    title: 'CMPSC 473 Final Exam',
    date: '2025-04-03T10:00:00Z',
    location: 'IST 111',
    durationMinutes: 120,
    topics: ['Virtual Memory', 'File Systems', 'Scheduling', 'Deadlocks'],
    readinessPercent: 88,
  },
  {
    id: 'exam_002',
    courseId: 'course_002',
    title: 'MATH 251 Final Exam',
    date: '2025-04-07T14:00:00Z',
    location: 'Thomas 100',
    durationMinutes: 180,
    topics: ['Stokes Theorem', 'Divergence Theorem', 'Surface Integrals', 'Line Integrals'],
    readinessPercent: 74,
  },
  {
    id: 'exam_003',
    courseId: 'course_003',
    title: 'ENGL 202 Final Essay',
    date: '2025-04-10T09:00:00Z',
    location: 'Online Submission',
    durationMinutes: 0,
    topics: ['Technical Report', 'Audience Analysis', 'Document Design'],
    readinessPercent: 91,
  },
];

export default exams;
