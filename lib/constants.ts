import type { SemesterTerm } from '@/types';

export const CURRENT_YEAR = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 5 + i);
export const TERM_OPTIONS: SemesterTerm[] = ['Fall', 'Spring', 'Summer'];

// Status display configuration
export const STATUS_CONFIG = {
  completed: { text: 'Completed', color: 'text-green-600 bg-green-50', border: 'border-green-300' },
  'in-progress': { text: 'In Progress', color: 'text-blue-600 bg-blue-50', border: 'border-blue-300' },
  planned: { text: 'Planned', color: 'text-yellow-600 bg-yellow-50', border: 'border-yellow-300' },
} as const;

export const getStatusDisplay = (status: keyof typeof STATUS_CONFIG) => STATUS_CONFIG[status];
