// SOURCE: Canvas → Submissions + Gradebook API
// Live endpoint: GET /api/v1/courses/:id/gradebook_history/days

export interface GradePoint {
  week: string;
  cmpsc: number;
  math:  number;
  engl:  number;
}

const gradeHistory: GradePoint[] = [
  { week: 'Wk 1',  cmpsc: 76, math: 70, engl: 84 },
  { week: 'Wk 2',  cmpsc: 79, math: 68, engl: 86 },
  { week: 'Wk 3',  cmpsc: 78, math: 72, engl: 85 },
  { week: 'Wk 4',  cmpsc: 83, math: 75, engl: 87 },
  { week: 'Wk 5',  cmpsc: 86, math: 78, engl: 88 },
  { week: 'Wk 6',  cmpsc: 88, math: 81, engl: 90 },
  { week: 'Wk 7',  cmpsc: 91, math: 85, engl: 91 },
  { week: 'Wk 8',  cmpsc: 94, math: 88, engl: 92 },
];

export default gradeHistory;
