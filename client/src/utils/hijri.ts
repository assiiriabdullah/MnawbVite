/**
 * Hijri (Islamic) Calendar Utility
 * Provides conversion between Gregorian and Hijri dates
 * Uses the Intl API with 'islamic-umalqura' calendar for accurate conversion
 */

// Hijri month names in Arabic
export const HIJRI_MONTHS: Record<number, string> = {
  1: 'محرم',
  2: 'صفر',
  3: 'ربيع الأول',
  4: 'ربيع الثاني',
  5: 'جمادى الأولى',
  6: 'جمادى الآخرة',
  7: 'رجب',
  8: 'شعبان',
  9: 'رمضان',
  10: 'شوال',
  11: 'ذو القعدة',
  12: 'ذو الحجة',
};

export interface HijriDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Convert a Gregorian date to Hijri date
 */
export function gregorianToHijri(date: Date): HijriDate {
  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const parts = formatter.formatToParts(date);
  let year = 0, month = 0, day = 0;
  
  for (const part of parts) {
    if (part.type === 'year') {
      year = parseInt(part.value);
    } else if (part.type === 'month') {
      month = parseInt(part.value);
    } else if (part.type === 'day') {
      day = parseInt(part.value);
    }
  }

  return { year, month, day };
}

/**
 * Format a Hijri date as a string (YYYY/MM/DD)
 */
export function formatHijriDate(hijri: HijriDate): string {
  return `${hijri.year}/${String(hijri.month).padStart(2, '0')}/${String(hijri.day).padStart(2, '0')}`;
}

/**
 * Format a Gregorian date string (YYYY-MM-DD) to Hijri display string
 */
export function gregorianToHijriString(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const hijri = gregorianToHijri(date);
  return formatHijriDate(hijri);
}

/**
 * Get Hijri month name and year for a Gregorian date string
 */
export function getHijriMonthYear(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const hijri = gregorianToHijri(date);
  return `${HIJRI_MONTHS[hijri.month]} ${hijri.year}`;
}

/**
 * Get the current Hijri date
 */
export function getCurrentHijriDate(): HijriDate {
  return gregorianToHijri(new Date());
}

/**
 * Format Hijri date with month name in Arabic
 */
export function formatHijriDateArabic(hijri: HijriDate): string {
  return `${hijri.day} ${HIJRI_MONTHS[hijri.month]} ${hijri.year}`;
}

/**
 * Convert a Gregorian date string to a full Arabic Hijri display
 */
export function toHijriArabic(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const hijri = gregorianToHijri(date);
  return formatHijriDateArabic(hijri);
}

/**
 * Add days to a Gregorian date string and return the resulting date string
 */
export function addDaysToDate(dateStr: string, days: number): string {
  if (!dateStr || days < 1) return '';
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days - 1); // -1 because start date counts as day 1
  return date.toISOString().split('T')[0];
}

/**
 * Get Hijri date info for display from a Gregorian YYYY-MM-DD string
 */
export function getHijriInfo(dateStr: string): { hijriStr: string; hijriArabic: string; hijri: HijriDate } | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr + 'T00:00:00');
    const hijri = gregorianToHijri(date);
    return {
      hijriStr: formatHijriDate(hijri),
      hijriArabic: formatHijriDateArabic(hijri),
      hijri,
    };
  } catch {
    return null;
  }
}

/**
 * Get the current Hijri month as a string "YYYY-MM" equivalent for the Hijri calendar
 */
export function getCurrentHijriMonthKey(): string {
  const hijri = getCurrentHijriDate();
  return `${hijri.year}-${String(hijri.month).padStart(2, '0')}`;
}

/**
 * Navigate Hijri months (increment/decrement)
 */
export function navigateHijriMonth(currentKey: string, direction: number): string {
  const [year, month] = currentKey.split('-').map(Number);
  let newMonth = month + direction;
  let newYear = year;
  
  if (newMonth > 12) {
    newMonth = 1;
    newYear += 1;
  } else if (newMonth < 1) {
    newMonth = 12;
    newYear -= 1;
  }
  
  return `${newYear}-${String(newMonth).padStart(2, '0')}`;
}

/**
 * Get Hijri month name from a "YYYY-MM" key
 */
export function hijriMonthName(monthKey: string): string {
  const [year, mon] = monthKey.split('-');
  const monthNum = parseInt(mon);
  return `${HIJRI_MONTHS[monthNum] || mon} ${year}`;
}

/**
 * Check if a Gregorian date falls within a Hijri month (defined by YYYY-MM key)
 */
export function isDateInHijriMonth(dateStr: string, hijriMonthKey: string): boolean {
  if (!dateStr || !hijriMonthKey) return false;
  const date = new Date(dateStr + 'T00:00:00');
  const hijri = gregorianToHijri(date);
  const currentKey = `${hijri.year}-${String(hijri.month).padStart(2, '0')}`;
  return currentKey === hijriMonthKey;
}

/**
 * Check if a leave (with start/end dates) overlaps with a Hijri month
 */
export function leaveOverlapsHijriMonth(startDate: string, endDate: string, hijriMonthKey: string): boolean {
  if (!startDate || !endDate || !hijriMonthKey) return false;
  
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  
  // Check each day of the leave to see if any falls in the hijri month
  const current = new Date(start);
  while (current <= end) {
    const hijri = gregorianToHijri(current);
    const key = `${hijri.year}-${String(hijri.month).padStart(2, '0')}`;
    if (key === hijriMonthKey) return true;
    current.setDate(current.getDate() + 1);
  }
  
  return false;
}
