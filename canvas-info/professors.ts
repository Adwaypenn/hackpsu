import type { CanvasProfessor } from './types';

// SOURCE: Canvas → Course Enrollments (teacher role) + manual enrichment
// Live endpoint: GET /api/v1/courses/:id/enrollments?type[]=TeacherEnrollment
const professors: CanvasProfessor[] = [
  {
    id: 'prof_001',
    name: 'Prof. Smith',
    courseId: 'course_001',
    email: 'smith@psu.edu',
    officeHours: 'Mon/Wed 2–4pm, IST 340',
    avgGradeGiven: 'B+',
    difficultyRating: 3.8,
    notes: 'Tends to curve exams. Very responsive on email.',
  },
  {
    id: 'prof_002',
    name: 'Prof. Lee',
    courseId: 'course_002',
    email: 'lee@psu.edu',
    officeHours: 'Tue/Thu 10am–12pm, Math Tower 214',
    avgGradeGiven: 'B+',
    difficultyRating: 4.1,
    notes: 'Homework-heavy but fair on exams. Office hours are very helpful.',
  },
  {
    id: 'prof_003',
    name: 'Prof. Davis',
    courseId: 'course_003',
    email: 'davis@psu.edu',
    officeHours: 'Fri 1–3pm, Burrowes 213',
    avgGradeGiven: 'A-',
    difficultyRating: 2.5,
    notes: 'Very clear rubrics. Grades based heavily on structure and citations.',
  },
];

export default professors;
