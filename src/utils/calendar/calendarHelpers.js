import { bsToAd, adToBs, getBsDaysInMonth } from './bsConverter';
import { isValid } from 'date-fns';

/**
 * Standardizes a date value (which could be a Date object, string, or number)
 * into a Gregorian AD Date object.
 * 
 * @param {Date|string|number|null|undefined} val - date representation
 * @param {string} outputMode - 'AD' | 'BS' (determines how string inputs are parsed)
 * @returns {Date|null} Gregorian Date object, or null
 */
export function parseDate(val, outputMode = 'AD') {
  if (!val) return null;
  if (val instanceof Date) return isValid(val) ? val : null;

  if (typeof val === 'string') {
    const clean = val.replace(/\//g, '-').trim();
    const match = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
      const y = parseInt(match[1], 10);
      const m = parseInt(match[2], 10) - 1; // Convert 1-based to 0-indexed
      const d = parseInt(match[3], 10);

      if (outputMode === 'BS') {
        // Parse as a Bikram Sambat date and convert to Gregorian
        const adDate = bsToAd(y, m, d);
        if (adDate) return adDate;
      } else {
        // Parse as a standard Gregorian date
        const adDate = new Date(y, m, d);
        if (isValid(adDate)) return adDate;
      }
    }
  }

  // Fallback to standard JS Date parsing
  const d = new Date(val);
  return isValid(d) ? d : null;
}

/**
 * Formats a Gregorian AD Date into a string representation for either AD or BS.
 * 
 * @param {Date|null} adDate - Gregorian Date object
 * @param {string} mode - 'AD' | 'BS'
 * @param {string} [formatStr='YYYY/MM/DD'] - format template (supports 'YYYY/MM/DD' and 'YYYY-MM-DD')
 * @returns {string} formatted string, or empty string
 */
export function formatDate(adDate, mode = 'AD', formatStr = 'YYYY/MM/DD') {
  if (!adDate || !(adDate instanceof Date) || isNaN(adDate.getTime())) {
    return '';
  }

  const separator = formatStr.includes('/') ? '/' : '-';

  if (mode === 'BS') {
    const bsDate = adToBs(adDate);
    if (!bsDate) return '';
    const yStr = bsDate.year.toString();
    const mStr = (bsDate.month + 1).toString().padStart(2, '0');
    const dStr = bsDate.date.toString().padStart(2, '0');
    return `${yStr}${separator}${mStr}${separator}${dStr}`;
  } else {
    const yStr = adDate.getFullYear().toString();
    const mStr = (adDate.getMonth() + 1).toString().padStart(2, '0');
    const dStr = adDate.getDate().toString().padStart(2, '0');
    return `${yStr}${separator}${mStr}${separator}${dStr}`;
  }
}

/**
 * Validates whether a given date is within valid bounds.
 */
export function isDateWithinRange(adDate, minAdDate, maxAdDate) {
  if (!adDate) return true;
  if (minAdDate && adDate < minAdDate) return false;
  if (maxAdDate && adDate > maxAdDate) return false;
  return true;
}
