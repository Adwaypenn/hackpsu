import type { CanvasAnnouncement } from './types';

// SOURCE: Canvas → Announcements API
// Live endpoint: GET /api/v1/courses/:id/discussion_topics?only_announcements=true
const announcements: CanvasAnnouncement[] = [
  {
    id: 'ann_001',
    courseId: 'course_001',
    title: 'Project 3 Office Hours This Week',
    body: 'I will be holding extra office hours Thu 3–5pm for Project 3 questions. Come prepared with specific questions.',
    postedAt: '2025-03-24T09:00:00Z',
  },
  {
    id: 'ann_002',
    courseId: 'course_002',
    title: 'Final Exam Room Change',
    body: 'The final has been moved to Thomas 100. Same time: April 7 at 2pm. Bring a scientific calculator.',
    postedAt: '2025-03-23T14:30:00Z',
  },
  {
    id: 'ann_003',
    courseId: 'course_003',
    title: 'Peer Review Deadline Extended',
    body: 'The peer review deadline has been extended to March 31. Feedback should be at least 200 words.',
    postedAt: '2025-03-25T11:00:00Z',
  },
];

export default announcements;
