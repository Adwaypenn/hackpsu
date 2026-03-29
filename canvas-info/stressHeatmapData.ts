// 4 weeks × 7 days of stress data for the heatmap (Mon–Sun)
// SOURCE: User-logged (not from Canvas)

export type StressLevel = 'Low' | 'Medium' | 'High';

export interface HeatCell {
  date: string;   // YYYY-MM-DD
  level: StressLevel;
}

// Weeks run Mon → Sun. 4 weeks displayed as rows.
const stressHeatmapData: HeatCell[] = [
  // Week 1 — Mar 3–9
  { date: '2025-03-03', level: 'Low'    },
  { date: '2025-03-04', level: 'Low'    },
  { date: '2025-03-05', level: 'Medium' },
  { date: '2025-03-06', level: 'Medium' },
  { date: '2025-03-07', level: 'Low'    },
  { date: '2025-03-08', level: 'Low'    },
  { date: '2025-03-09', level: 'Low'    },

  // Week 2 — Mar 10–16
  { date: '2025-03-10', level: 'Medium' },
  { date: '2025-03-11', level: 'High'   },
  { date: '2025-03-12', level: 'High'   },
  { date: '2025-03-13', level: 'Medium' },
  { date: '2025-03-14', level: 'Medium' },
  { date: '2025-03-15', level: 'Low'    },
  { date: '2025-03-16', level: 'Low'    },

  // Week 3 — Mar 17–23
  { date: '2025-03-17', level: 'Medium' },
  { date: '2025-03-18', level: 'High'   },
  { date: '2025-03-19', level: 'High'   },
  { date: '2025-03-20', level: 'High'   },
  { date: '2025-03-21', level: 'Medium' },
  { date: '2025-03-22', level: 'Low'    },
  { date: '2025-03-23', level: 'Low'    },

  // Week 4 — Mar 24–30 (current)
  { date: '2025-03-24', level: 'Low'    },
  { date: '2025-03-25', level: 'Medium' },
  { date: '2025-03-26', level: 'High'   },
  { date: '2025-03-27', level: 'High'   },
  { date: '2025-03-28', level: 'Medium' },
  { date: '2025-03-29', level: 'Low'    },
  { date: '2025-03-30', level: 'Medium' },
];

export default stressHeatmapData;
