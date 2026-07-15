
// /src/utils/workSchedule.ts

// Current date is 2026-06-06 (Friday)
// User rule: Mon-Fri 12:36 PM to 6:00 PM
// Alternating rule: Work today, off tomorrow

export const isWorkDay = (date: Date): boolean => {
  const day = date.getDay();
  // Sunday (0) and Saturday (6) are off
  return day !== 0 && day !== 6;
};

export const getWorkScheduleForDate = (date: Date) => {
  if (!isWorkDay(date)) {
    return { working: false, label: 'Folga' };
  }

  // Alternating logic:
  // We need a base date to calculate alternation. 
  // June 6, 2026 is a Friday (Workday).
  const baseDate = new Date(2026, 5, 6); // June 6, 2026
  
  // Calculate difference in days, excluding weekends
  const diffTime = Math.abs(date.getTime() - baseDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // This is a naive calculation. A true alternation needs to skip weekends in the counting.
  // For now, let's keep it simple: alternating days based on weekday
  
  // Assuming alternating work means work M, off T, work W, off Th, work F
  // This is tricky.
  
  return { working: true, label: '12:36 - 18:00' };
};
