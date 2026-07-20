/**
 * Default event categories — inserted only if name does not already exist.
 */
export const DEFAULT_EVENT_CATEGORIES = [
  { name: 'Crime Reduction', icon: '🛡️', sort_order: 1 },
  { name: 'Cleanliness & Hygiene', icon: '🧹', sort_order: 2 },
  { name: 'Addiction Control', icon: '💊', sort_order: 3 },
  { name: 'Pollution Control', icon: '🌱', sort_order: 4 },
  { name: 'Transportation Discipline', icon: '🚦', sort_order: 5 },
  { name: 'Social Connection', icon: '🤝', sort_order: 6 },
  { name: 'Happiness & Well-being', icon: '😊', sort_order: 7 },
] as const;
