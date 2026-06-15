import { BS_DATA } from './bsData';

// Epoch references:
// BS Year 2000 Baisakh 1 corresponds to Gregorian (AD) 1943-04-14.
const BS_EPOCH_YEAR = 2000;
const AD_EPOCH_YEAR = 1943;
const AD_EPOCH_MONTH = 3; // April (0-indexed)
const AD_EPOCH_DAY = 14;

// Cache total days of each BS year for faster computation
const YEAR_DAYS_CACHE = {};
const YEAR_CUMULATIVE_DAYS = {};
let cumulativeDays = 0;

// Initialize caches
const yearKeys = Object.keys(BS_DATA).map(Number).sort((a, b) => a - b);
const minBSYear = yearKeys[0];
const maxBSYear = yearKeys[yearKeys.length - 1];

for (let y = minBSYear; y <= maxBSYear; y++) {
  const months = BS_DATA[y];
  const daysInYear = months.reduce((sum, d) => sum + d, 0);
  YEAR_DAYS_CACHE[y] = daysInYear;
  YEAR_CUMULATIVE_DAYS[y] = cumulativeDays;
  cumulativeDays += daysInYear;
}

const TOTAL_SUPPORTED_DAYS = cumulativeDays;

/**
 * Checks if a given BS year is in the supported dataset.
 */
export function isBsYearSupported(year) {
  return year >= minBSYear && year <= maxBSYear;
}

/**
 * Gets the number of days in a specific BS year and month.
 * @param {number} year - BS year (e.g. 2083)
 * @param {number} month - 0-indexed month (0 = Baisakh, 11 = Chaitra)
 * @returns {number} number of days in month, or 30 as a safe fallback
 */
export function getBsDaysInMonth(year, month) {
  if (BS_DATA[year] && BS_DATA[year][month] !== undefined) {
    return BS_DATA[year][month];
  }
  // Safe fallback if out of dataset range
  return 30;
}

/**
 * Converts a Bikram Sambat (BS) date to a Gregorian (AD) Date.
 * Supports passing either (year, month, date) or an object { year, month, date }
 * 
 * @param {number|object} yearOrObj - BS year or object { year, month, date }
 * @param {number} [month] - 0-indexed month (0 = Baisakh, 11 = Chaitra)
 * @param {number} [date] - Day of the month (1-based)
 * @returns {Date|null} Gregorian Date object, or null if invalid/out-of-range
 */
export function bsToAd(yearOrObj, month, date) {
  let y, m, d;
  if (typeof yearOrObj === 'object' && yearOrObj !== null) {
    y = Number(yearOrObj.year);
    m = Number(yearOrObj.month);
    d = Number(yearOrObj.date);
  } else {
    y = Number(yearOrObj);
    m = Number(month);
    d = Number(date);
  }

  if (isNaN(y) || isNaN(m) || isNaN(d)) {
    return null;
  }

  if (!isBsYearSupported(y)) {
    return null; // Out of supported range
  }

  if (m < 0 || m > 11) {
    return null;
  }

  const daysInMonth = getBsDaysInMonth(y, m);
  if (d < 1 || d > daysInMonth) {
    return null;
  }

  // Calculate days elapsed from BS 2000 Baisakh 1 to the target date
  let elapsedDays = YEAR_CUMULATIVE_DAYS[y] - YEAR_CUMULATIVE_DAYS[BS_EPOCH_YEAR];
  
  // Add days of preceding months in the same year
  const months = BS_DATA[y];
  for (let i = 0; i < m; i++) {
    elapsedDays += months[i];
  }
  
  // Add current month's days
  elapsedDays += (d - 1);

  // Add elapsed days to Gregorian epoch start date (April 14, 1943)
  const adEpoch = new Date(Date.UTC(AD_EPOCH_YEAR, AD_EPOCH_MONTH, AD_EPOCH_DAY));
  const adTarget = new Date(adEpoch.getTime() + elapsedDays * 24 * 60 * 60 * 1000);
  
  // Return standard local Date object representing that calendar date
  return new Date(adTarget.getUTCFullYear(), adTarget.getUTCMonth(), adTarget.getUTCDate());
}

/**
 * Converts a Gregorian (AD) Date to a Bikram Sambat (BS) date.
 * 
 * @param {Date|string|number} adDate - Date object or something parseable by Date
 * @returns {object|null} { year, month, date, day } where month is 0-indexed, or null if out-of-range
 */
export function adToBs(adDate) {
  const parsedDate = adDate instanceof Date ? adDate : new Date(adDate);
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return null;
  }

  // Compute UTC midnight dates to avoid local timezone/DST discrepancy
  const epochUTC = Date.UTC(AD_EPOCH_YEAR, AD_EPOCH_MONTH, AD_EPOCH_DAY);
  const targetUTC = Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
  
  const diffTime = targetUTC - epochUTC;
  const elapsedDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));

  if (elapsedDays < 0 || elapsedDays >= TOTAL_SUPPORTED_DAYS) {
    return null; // Out of range
  }

  let daysRemaining = elapsedDays;
  let currentYear = BS_EPOCH_YEAR;

  // Subtract full years
  while (daysRemaining >= YEAR_DAYS_CACHE[currentYear]) {
    daysRemaining -= YEAR_DAYS_CACHE[currentYear];
    currentYear++;
    if (!isBsYearSupported(currentYear)) {
      return null;
    }
  }

  // Subtract full months
  let currentMonth = 0;
  const months = BS_DATA[currentYear];
  while (daysRemaining >= months[currentMonth]) {
    daysRemaining -= months[currentMonth];
    currentMonth++;
  }

  const currentDate = daysRemaining + 1;
  const dayOfWeek = parsedDate.getDay(); // 0 = Sunday, 6 = Saturday

  return {
    year: currentYear,
    month: currentMonth,
    date: currentDate,
    day: dayOfWeek
  };
}
