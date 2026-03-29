import type { CanvasAssignment } from './types';

// SOURCE: Canvas → Assignments API
// Live endpoint: GET /api/v1/courses/:course_id/assignments
const assignments: CanvasAssignment[] = [
  // CMPSC 473
  {
    id: 'asgn_001',
    courseId: 'course_001',
    title: 'Project 3 – Virtual Memory',
    dueDate: '2025-04-01T23:59:00Z',
    pointsPossible: 100,
    score: null,
    submissionType: 'online_upload',
    status: 'upcoming',
  },
  {
    id: 'asgn_002',
    courseId: 'course_001',
    title: 'Midterm Exam',
    dueDate: '2025-03-10T10:00:00Z',
    pointsPossible: 100,
    score: 91,
    submissionType: 'exam',
    status: 'graded',
  },
  {
    id: 'asgn_003',
    courseId: 'course_001',
    title: 'Quiz 4 – Scheduling Algorithms',
    dueDate: '2025-03-25T23:59:00Z',
    pointsPossible: 20,
    score: 18,
    submissionType: 'online_text_entry',
    status: 'graded',
  },

  // MATH 251
  {
    id: 'asgn_004',
    courseId: 'course_002',
    title: 'Homework 8 – Surface Integrals',
    dueDate: '2025-03-28T23:59:00Z',
    pointsPossible: 50,
    score: null,
    submissionType: 'online_upload',
    status: 'upcoming',
  },
  {
    id: 'asgn_005',
    courseId: 'course_002',
    title: 'Midterm 2',
    dueDate: '2025-03-18T09:00:00Z',
    pointsPossible: 100,
    score: 84,
    submissionType: 'exam',
    status: 'graded',
  },
  {
    id: 'asgn_006',
    courseId: 'course_002',
    title: 'Homework 9 – Stokes Theorem',
    dueDate: '2025-04-04T23:59:00Z',
    pointsPossible: 50,
    score: null,
    submissionType: 'online_upload',
    status: 'upcoming',
  },

  // ENGL 202
  {
    id: 'asgn_007',
    courseId: 'course_003',
    title: 'Technical Report Draft',
    dueDate: '2025-03-22T23:59:00Z',
    pointsPossible: 100,
    score: 88,
    submissionType: 'online_upload',
    status: 'graded',
  },
  {
    id: 'asgn_008',
    courseId: 'course_003',
    title: 'Peer Review – Report 2',
    dueDate: '2025-03-29T23:59:00Z',
    pointsPossible: 30,
    score: null,
    submissionType: 'online_text_entry',
    status: 'upcoming',
  },
];

export default assignments;
