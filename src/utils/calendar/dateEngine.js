import { bsToAd, adToBs, getBsDaysInMonth, isBsYearSupported } from './bsConverter';
import { getAdDaysInMonth, getAdMonthName } from './adConverter';

export const BS_MONTHS = [
  'Baisakh', 'Jestha', 'Ashar', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

export const BS_MONTHS_SHORT = [
  'Bai', 'Jes', 'Ash', 'Shr', 'Bhd', 'Asw', 'Kar', 'Man', 'Pou', 'Mag', 'Fal', 'Cha'
];

export const AD_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const AD_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Gets month names for the given calendar mode.
 */
export function getMonthNames(calendarMode, short = false) {
  if (calendarMode === 'BS') {
    return short ? BS_MONTHS_SHORT : BS_MONTHS;
  }
  return short ? AD_MONTHS_SHORT : AD_MONTHS;
}

/**
 * Gets a specific month name.
 */
export function getMonthName(monthIndex, calendarMode, short = false) {
  const names = getMonthNames(calendarMode, short);
  return names[monthIndex] || '';
}

/**
 * Gets the number of days in a month for either AD or BS mode.
 */
export function getDaysInMonth(year, month, calendarMode) {
  if (calendarMode === 'BS') {
    return getBsDaysInMonth(year, month);
  }
  return getAdDaysInMonth(year, month);
}

/**
 * Navigates to the next month.
 * @returns {object} { year, month }
 */
export function getNextMonth(year, month, calendarMode) {
  if (calendarMode === 'BS') {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    return { year: newYear, month: newMonth };
  } else {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    return { year: newYear, month: newMonth };
  }
}

/**
 * Navigates to the previous month.
 * @returns {object} { year, month }
 */
export function getPrevMonth(year, month, calendarMode) {
  if (calendarMode === 'BS') {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    return { year: newYear, month: newMonth };
  } else {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    return { year: newYear, month: newMonth };
  }
}

/**
 * Generates the grid layout for a given year and month.
 * Returns { emptyDaysCount, days } where days is an array of objects:
 * { year, month, date, key, isToday, isCurrentMonth, adDate }
 */
export function generateCalendarGrid(year, month, calendarMode, selectedAdDate) {
  const displayDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  let emptyDaysCount = 0;
  const days = [];

  const today = new Date();
  const todayDateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const selectedDateStr = selectedAdDate 
    ? `${selectedAdDate.getFullYear()}-${selectedAdDate.getMonth()}-${selectedAdDate.getDate()}`
    : '';

  if (calendarMode === 'BS') {
    // Determine the week day of Baisakh 1st or the 1st of target month
    const firstOfMonthAd = bsToAd(year, month, 1);
    if (firstOfMonthAd) {
      emptyDaysCount = firstOfMonthAd.getDay(); // 0 = Sunday, etc.
    }

    const totalDays = getBsDaysInMonth(year, month);
    for (let d = 1; d <= totalDays; d++) {
      const cellAdDate = bsToAd(year, month, d);
      let isToday = false;
      let isSelected = false;
      
      if (cellAdDate) {
        isToday = `${cellAdDate.getFullYear()}-${cellAdDate.getMonth()}-${cellAdDate.getDate()}` === todayDateStr;
        isSelected = selectedDateStr && `${cellAdDate.getFullYear()}-${cellAdDate.getMonth()}-${cellAdDate.getDate()}` === selectedDateStr;
      }

      days.push({
        year,
        month,
        date: d,
        isToday,
        isSelected,
        adDate: cellAdDate,
        key: `bs-${year}-${month}-${d}`
      });
    }
  } else {
    // AD mode
    const firstOfMonthAd = new Date(year, month, 1);
    emptyDaysCount = firstOfMonthAd.getDay();

    const totalDays = getAdDaysInMonth(year, month);
    for (let d = 1; d <= totalDays; d++) {
      const cellAdDate = new Date(year, month, d);
      const isToday = `${cellAdDate.getFullYear()}-${cellAdDate.getMonth()}-${cellAdDate.getDate()}` === todayDateStr;
      const isSelected = selectedDateStr && `${cellAdDate.getFullYear()}-${cellAdDate.getMonth()}-${cellAdDate.getDate()}` === selectedDateStr;

      days.push({
        year,
        month,
        date: d,
        isToday,
        isSelected,
        adDate: cellAdDate,
        key: `ad-${year}-${month}-${d}`
      });
    }
  }

  return {
    displayDays,
    emptyDaysCount,
    days
  };
}
