// Approximate grade distribution per professor (% of students)
// SOURCE: Manually enriched — in future could come from RateMyProfessors API

export interface DistributionRow {
  grade:  string;
  smith:  number; // CMPSC 473
  lee:    number; // MATH 251
  davis:  number; // ENGL 202
}

const profDistribution: DistributionRow[] = [
  { grade: 'A',  smith: 22, lee: 10, davis: 35 },
  { grade: 'A-', smith: 27, lee: 14, davis: 28 },
  { grade: 'B+', smith: 24, lee: 20, davis: 20 },
  { grade: 'B',  smith: 16, lee: 28, davis: 12 },
  { grade: 'B-', smith: 8,  lee: 16, davis: 4  },
  { grade: 'C+', smith: 3,  lee: 12, davis: 1  },
];

export default profDistribution;
