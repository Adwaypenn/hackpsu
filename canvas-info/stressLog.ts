import type { CanvasStressLog } from './types';

// SOURCE: User-logged data (not from Canvas)
// This will be stored locally or in a lightweight backend once logging is live.
// Keyed by ISO date string for easy lookup and chart rendering.
const stressLog: CanvasStressLog[] = [
  { date: '2025-03-24', level: 'Low'    },
  { date: '2025-03-25', level: 'Medium' },
  { date: '2025-03-26', level: 'High'   },
  { date: '2025-03-27', level: 'High'   },
  { date: '2025-03-28', level: 'Medium' },
  { date: '2025-03-29', level: 'Low'    },
  { date: '2025-03-30', level: 'Medium' },
];

export default stressLog;
