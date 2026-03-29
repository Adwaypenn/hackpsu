import type { CanvasCourse } from './types';

// SOURCE: Canvas → Courses API
// Live endpoint: GET /api/v1/courses?enrollment_state=active
const courses: CanvasCourse[] = [
  {
    id: 'course_001',
    name: 'Operating Systems Design',
    courseCode: 'CMPSC 473',
    instructor: 'Prof. Smith',
    credits: 3,
    term: 'Spring 2025',
    currentGrade: 'A',
    currentScore: 94.2,
  },
  {
    id: 'course_002',
    name: 'Calculus III',
    courseCode: 'MATH 251',
    instructor: 'Prof. Lee',
    credits: 4,
    term: 'Spring 2025',
    currentGrade: 'B+',
    currentScore: 87.5,
  },
  {
    id: 'course_003',
    name: 'Technical Writing',
    courseCode: 'ENGL 202',
    instructor: 'Prof. Davis',
    credits: 3,
    term: 'Spring 2025',
    currentGrade: 'A-',
    currentScore: 91.8,
  },
];

export default courses;
