/**
 * Gregorian (AD) Calendar Utilities
 */

const AD_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AD_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Checks if a given Gregorian year is a leap year.
 */
export function isAdLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Gets the number of days in a specific Gregorian year and month.
 * @param {number} year - Gregorian year (e.g. 2026)
 * @param {number} month - 0-indexed month (0 = January, 11 = December)
 * @returns {number} number of days in the month
 */
export function getAdDaysInMonth(year, month) {
  const days = [31, isAdLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month];
}

/**
 * Gets the Gregorian month name.
 * @param {number} monthIndex - 0-indexed month
 * @param {boolean} [short=false] - whether to return short name
 */
export function getAdMonthName(monthIndex, short = false) {
  return short ? AD_MONTHS_SHORT[monthIndex] : AD_MONTHS[monthIndex];
}
