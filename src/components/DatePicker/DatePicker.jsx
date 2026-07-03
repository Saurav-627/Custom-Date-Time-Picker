import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, isValid, addMonths, subMonths, addYears, subYears } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import SharedInput from '../Shared/SharedInput';
import { useMobile } from '../../hooks/useMediaQuery';
import './DatePicker.css';

// Calendar Engine imports
import {
    bsToAd,
    adToBs,
    getBsDaysInMonth,
    getMonthName,
    getMonthNames,
    BS_MONTHS,
    BS_MONTHS_SHORT,
    AD_MONTHS,
    parseDate,
    formatDate,
    generateCalendarGrid,
    getAdMonthName,
    getNextMonth,
    getPrevMonth,
    minBSYear,
    maxBSYear
} from '../../utils/calendar';

const DatePicker = ({
    value,
    onChange,
    placeholder = "YYYY/MM/DD",
    name,
    onBlur,
    disabled = false,
    isDarkMode = undefined,
    calendarMode = "AD",
    displayMode: propDisplayMode,
    outputMode = "AD"
}) => {
    const isMobile = useMobile();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('calendar');

    const themeClass = isDarkMode === true ? 'dark-theme' : isDarkMode === false ? 'light-theme' : '';

    // Active calendar display mode state
    const [activeMode, setActiveMode] = useState(() => {
        return propDisplayMode || calendarMode || 'AD';
    });
    const [confirmedMode, setConfirmedMode] = useState(() => {
        return propDisplayMode || calendarMode || 'AD';
    });

    useEffect(() => {
        const targetMode = propDisplayMode || calendarMode || 'AD';
        setActiveMode(targetMode);
        setConfirmedMode(targetMode);
    }, [propDisplayMode, calendarMode]);

    const parsedValue = parseDate(value, outputMode === 'selection' ? confirmedMode : outputMode);

    const [inputValue, setInputValue] = useState(() => {
        return parsedValue ? formatDate(parsedValue, propDisplayMode || activeMode, 'YYYY/MM/DD') : '';
    });
    const [tempDate, setTempDate] = useState(() => parsedValue || new Date());
    const [currentMonth, setCurrentMonth] = useState(() => parsedValue || new Date());
    const [isFocused, setIsFocused] = useState(false);
    const pickerRef = useRef(null);
    const dropdownRef = useRef(null);

    const yearRef = useRef(null);
    const monthRef = useRef(null);
    const dayRef = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const openTimeRef = useRef(0);

    const [portalStyle, setPortalStyle] = useState({});

    const updatePosition = () => {
        if (!pickerRef.current) return;
        const rect = pickerRef.current.getBoundingClientRect();
        // Check if there is enough space below the input (approx 380px)
        const spaceBelow = window.innerHeight - rect.bottom;
        const showAbove = spaceBelow < 380 && rect.top > 380;
        const top = showAbove
            ? rect.top + window.scrollY - 380
            : rect.bottom + window.scrollY + 8;

        setPortalStyle({
            position: 'absolute',
            top: `${top}px`,
            left: `${rect.left + window.scrollX}px`,
            zIndex: 999999
        });
    };

    useEffect(() => {
        if (isOpen && !isMobile) {
            updatePosition();
            const id = requestAnimationFrame(updatePosition);
            const handleScrollResize = () => {
                updatePosition();
            };
            window.addEventListener('resize', handleScrollResize);
            window.addEventListener('scroll', handleScrollResize, true);
            return () => {
                cancelAnimationFrame(id);
                window.removeEventListener('resize', handleScrollResize);
                window.removeEventListener('scroll', handleScrollResize, true);
            };
        }
    }, [isOpen, isMobile]);

    // Dynamic Mobile scroll columns based on calendar mode
    const mobileYears = activeMode === 'BS'
        ? Array.from({ length: maxBSYear - minBSYear + 1 }, (_, i) => minBSYear + i) // Dynamic BS Range
        : Array.from({ length: 151 }, (_, i) => new Date().getFullYear() - 100 + i);

    const mobileMonths = activeMode === 'BS' ? BS_MONTHS : AD_MONTHS;

    let daysInMonth = 30;
    if (activeMode === 'BS') {
        const bsView = adToBs(tempDate);
        daysInMonth = bsView ? getBsDaysInMonth(bsView.year, bsView.month) : 30;
    } else {
        daysInMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate();
    }
    const daysArr = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Sync input values when value prop changes from outside or calendar closes
    useEffect(() => {
        if (!isFocused && !isOpen) {
            if (activeMode !== confirmedMode) {
                setActiveMode(confirmedMode);
                return;
            }
            const dateObj = parseDate(value, outputMode === 'selection' ? confirmedMode : outputMode);
            if (dateObj) {
                const formatted = formatDate(dateObj, propDisplayMode || confirmedMode, 'YYYY/MM/DD');
                setInputValue(formatted);
                setCurrentMonth(dateObj);
                setTempDate(dateObj);
            } else {
                setInputValue('');
                setTempDate(new Date());
            }
        }
    }, [value, isFocused, isOpen, outputMode, propDisplayMode, activeMode, confirmedMode]);

    // Sync input field value when mode toggle changes
    useEffect(() => {
        if (isOpen) {
            const dateObj = tempDate || parseDate(value, outputMode === 'selection' ? confirmedMode : outputMode) || new Date();
            const formatted = formatDate(dateObj, propDisplayMode || activeMode, 'YYYY/MM/DD');
            setInputValue(formatted);
        }
    }, [activeMode]);

    // Scroll synchronizer for mobile wheel picking
    useEffect(() => {
        if (isOpen && isMobile) {
            const syncScrolls = () => {
                let targetYear, targetMonth, targetDay;
                if (activeMode === 'BS') {
                    const bsView = adToBs(tempDate);
                    if (bsView) {
                        targetYear = bsView.year;
                        targetMonth = bsView.month;
                        targetDay = bsView.date;
                    }
                } else {
                    targetYear = tempDate.getFullYear();
                    targetMonth = tempDate.getMonth();
                    targetDay = tempDate.getDate();
                }

                if (targetYear !== undefined) {
                    const yIdx = mobileYears.indexOf(targetYear);
                    if (yearRef.current && yIdx !== -1) yearRef.current.scrollTop = yIdx * 32;
                    if (monthRef.current) monthRef.current.scrollTop = targetMonth * 32;
                    if (dayRef.current) dayRef.current.scrollTop = (targetDay - 1) * 32;
                }
            };

            syncScrolls();
            const t1 = setTimeout(syncScrolls, 50);
            const t2 = setTimeout(syncScrolls, 300);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [isOpen, isMobile, activeMode, tempDate]);

    const toggleOpen = () => {
        if (disabled) return;
        if (!isOpen) {
            const dateToUse = parseDate(value, outputMode === 'selection' ? confirmedMode : outputMode) || new Date();
            setTempDate(dateToUse);
            setCurrentMonth(dateToUse);
            setView('calendar');
            openTimeRef.current = Date.now();
        }
        setIsOpen(!isOpen);
    };

    const triggerChange = (date) => {
        const outMode = outputMode === 'selection' ? activeMode : outputMode;
        const formatted = date ? formatDate(date, outMode, 'YYYY-MM-DD') : '';
        if (onChange) {
            onChange({
                target: {
                    name: name,
                    value: formatted,
                    mode: activeMode
                },
                mode: activeMode
            });
        }
        setConfirmedMode(activeMode);
    };

    const handleModeToggle = (mode) => {
        if (mode === activeMode) return;
        setActiveMode(mode);
    };

    const handleConfirm = () => {
        triggerChange(tempDate);
        setInputValue(formatDate(tempDate, propDisplayMode || activeMode, 'YYYY/MM/DD'));
        setIsOpen(false);
    };

    const handleInputChange = (val) => {
        setInputValue(val);
        if (val === '') {
            triggerChange(null);
            setTempDate(new Date());
            return;
        }
        const parsedDate = parseDate(val, activeMode);
        if (parsedDate) {
            triggerChange(parsedDate);
            setCurrentMonth(parsedDate);
            setTempDate(parsedDate);
        }
    };

    const handleDateSelect = (date) => {
        if (isMobile) {
            setTempDate(date);
        } else {
            triggerChange(date);
            setInputValue(formatDate(date, propDisplayMode || activeMode, 'YYYY/MM/DD'));
            setIsOpen(false);
        }
    };

    const handleTodayClick = () => {
        const today = new Date();
        setCurrentMonth(today);
        setTempDate(today);
        setView('calendar');
        triggerChange(today);
        setInputValue(formatDate(today, propDisplayMode || activeMode, 'YYYY/MM/DD'));
    };

    const handleYearSelect = (year) => {
        if (activeMode === 'BS') {
            const bsView = adToBs(currentMonth);
            const targetMonth = bsView ? bsView.month : 0;
            const maxDays = getBsDaysInMonth(year, targetMonth);
            const targetDate = Math.min(bsView ? bsView.date : 1, maxDays);
            const newDate = bsToAd(year, targetMonth, targetDate);
            if (newDate) {
                setCurrentMonth(newDate);
            }
        } else {
            const newDate = new Date(currentMonth);
            newDate.setFullYear(year);
            setCurrentMonth(newDate);
        }
        setView('calendar');
    };

    const handleMonthSelect = (monthIdx) => {
        if (activeMode === 'BS') {
            const bsView = adToBs(currentMonth);
            const targetYear = bsView ? bsView.year : 2080;
            const maxDays = getBsDaysInMonth(targetYear, monthIdx);
            const targetDate = Math.min(bsView ? bsView.date : 1, maxDays);
            const newDate = bsToAd(targetYear, monthIdx, targetDate);
            if (newDate) {
                setCurrentMonth(newDate);
            }
        } else {
            const newDate = new Date(currentMonth);
            newDate.setMonth(monthIdx);
            setCurrentMonth(newDate);
        }
        setView('calendar');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobile) return;
            const clickedInsideInput = pickerRef.current && pickerRef.current.contains(event.target);
            const clickedInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
            if (!clickedInsideInput && !clickedInsideDropdown) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile]);

    useEffect(() => {
        if (isMobile && isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, isMobile]);

    const renderMonths = () => {
        const bsView = activeMode === 'BS' ? adToBs(currentMonth) : null;
        const monthsList = getMonthNames(activeMode, false);
        const activeMonthIdx = activeMode === 'BS' ? (bsView ? bsView.month : 0) : currentMonth.getMonth();

        return (
            <div className="selector-view">
                <div className="calendar-header">
                    <span>Select Month</span>
                </div>
                <div className="grid-selector column-3">
                    {monthsList.map((m, i) => (
                        <button
                            type="button"
                            key={m}
                            className={`select-cell ${activeMonthIdx === i ? 'active' : ''}`}
                            onClick={() => handleMonthSelect(i)}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderYears = () => {
        const bsView = activeMode === 'BS' ? adToBs(currentMonth) : null;
        const currentYearVal = activeMode === 'BS' ? (bsView ? bsView.year : 2080) : currentMonth.getFullYear();

        const startYear = Math.floor(currentYearVal / 12) * 12;
        const yearsGrid = Array.from({ length: 12 }, (_, i) => startYear + i);

        return (
            <div className="selector-view">
                <div className="calendar-header">
                    <button type="button" onClick={() => {
                        if (activeMode === 'BS') {
                            const newBsYear = Math.max(minBSYear, currentYearVal - 12);
                            const newAdDate = bsToAd(newBsYear, bsView ? bsView.month : 0, 1);
                            if (newAdDate) setCurrentMonth(newAdDate);
                        } else {
                            setCurrentMonth(subYears(currentMonth, 12));
                        }
                    }}><ChevronLeft size={16} /></button>
                    <span>Select Year</span>
                    <button type="button" onClick={() => {
                        if (activeMode === 'BS') {
                            const newBsYear = Math.min(maxBSYear, currentYearVal + 12);
                            const newAdDate = bsToAd(newBsYear, bsView ? bsView.month : 0, 1);
                            if (newAdDate) setCurrentMonth(newAdDate);
                        } else {
                            setCurrentMonth(addYears(currentMonth, 12));
                        }
                    }}><ChevronRight size={16} /></button>
                </div>
                <div className="grid-selector column-3">
                    {yearsGrid.map(y => {
                        const isDisabled = activeMode === 'BS' && (y < minBSYear || y > maxBSYear);
                        return (
                            <button
                                type='button'
                                key={y}
                                className={`select-cell ${currentYearVal === y ? 'active' : ''}`}
                                disabled={isDisabled}
                                style={isDisabled ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                                onClick={() => !isDisabled && handleYearSelect(y)}
                            >
                                {y}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderCalendar = () => {
        const bsView = activeMode === 'BS' ? adToBs(currentMonth) : null;
        const grid = generateCalendarGrid(
            activeMode === 'BS' ? (bsView ? bsView.year : 2080) : currentMonth.getFullYear(),
            activeMode === 'BS' ? (bsView ? bsView.month : 0) : currentMonth.getMonth(),
            activeMode,
            tempDate
        );

        if (view === 'year') return renderYears();
        if (view === 'month') return renderMonths();

        // Subtitle logic showing corresponding other-mode months/years
        let subtitle = null;
        if (activeMode === 'BS') {
            const startAd = bsToAd(bsView ? bsView.year : 2080, bsView ? bsView.month : 0, 1);
            const endAd = bsToAd(
                bsView ? bsView.year : 2080,
                bsView ? bsView.month : 0,
                getBsDaysInMonth(bsView ? bsView.year : 2080, bsView ? bsView.month : 0)
            );
            if (startAd && endAd) {
                const startMonthName = getAdMonthName(startAd.getMonth(), true);
                const endMonthName = getAdMonthName(endAd.getMonth(), true);
                const startYear = startAd.getFullYear();
                const endYear = endAd.getFullYear();
                const yearText = startYear === endYear ? `${startYear}` : `${startYear}/${endYear.toString().slice(-2)}`;
                subtitle = `(${startMonthName}/${endMonthName} ${yearText} AD)`;
            }
        } else {
            const startBs = adToBs(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
            const endBs = adToBs(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0));
            if (startBs && endBs) {
                const startMonthName = getMonthName(startBs.month, 'BS', true);
                const endMonthName = getMonthName(endBs.month, 'BS', true);
                const startYear = startBs.year;
                const endYear = endBs.year;
                const yearText = startYear === endYear ? `${startYear}` : `${startYear}/${endYear.toString().slice(-2)}`;
                subtitle = `(${startMonthName}/${endMonthName} ${yearText} BS)`;
            }
        }

        return (
            <div className="desktop-calendar">
                <div className="calendar-header">
                    <button type="button" onClick={() => {
                        if (activeMode === 'BS') {
                            const prev = getPrevMonth(bsView ? bsView.year : 2080, bsView ? bsView.month : 0, 'BS');
                            const prevAd = bsToAd(prev.year, prev.month, 1);
                            if (prevAd) setCurrentMonth(prevAd);
                        } else {
                            setCurrentMonth(subMonths(currentMonth, 1));
                        }
                    }}>
                        <ChevronLeft size={18} />
                    </button>
                    <div className="header-nav" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div>
                            <span className="nav-btn" onClick={() => setView('month')}>
                                {activeMode === 'BS' ? getMonthName(bsView ? bsView.month : 0, 'BS') : format(currentMonth, 'MMMM')}
                            </span>
                            <span className="nav-btn" onClick={() => setView('year')}>
                                {activeMode === 'BS' ? (bsView ? bsView.year : 2080) : format(currentMonth, 'yyyy')}
                            </span>
                        </div>
                        {subtitle && <span className="subtitle-muted">{subtitle}</span>}
                    </div>
                    <button type="button" onClick={() => {
                        if (activeMode === 'BS') {
                            const next = getNextMonth(bsView ? bsView.year : 2080, bsView ? bsView.month : 0, 'BS');
                            const nextAd = bsToAd(next.year, next.month, 1);
                            if (nextAd) setCurrentMonth(nextAd);
                        } else {
                            setCurrentMonth(addMonths(currentMonth, 1));
                        }
                    }}>
                        <ChevronRight size={18} />
                    </button>
                </div>
                <div className="calendar-grid">
                    {grid.displayDays.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
                    {Array(grid.emptyDaysCount).fill(null).map((_, i) => (
                        <div key={`empty-lead-${i}`} className="calendar-day-cell empty" />
                    ))}
                    {grid.days.map(dayInfo => (
                        <button
                            type="button"
                            key={dayInfo.key}
                            className={`calendar-day-cell ${dayInfo.isSelected ? 'active' : ''} ${dayInfo.isToday ? 'today' : ''}`}
                            onClick={() => handleDateSelect(dayInfo.adDate)}
                        >
                            {dayInfo.date}
                        </button>
                    ))}
                    {Array(42 - (grid.emptyDaysCount + grid.days.length)).fill(null).map((_, i) => (
                        <div key={`empty-trail-${i}`} className="calendar-day-cell empty" />
                    ))}
                </div>
                <div className="calendar-footer">
                    <button
                        type="button"
                        className="today-btn"
                        onClick={handleTodayClick}
                    >
                        Today
                    </button>
                </div>
            </div>
        );
    };

    const renderMobilePicker = () => {
        const updateDate = (part, val) => {
            if (activeMode === 'BS') {
                const bsView = adToBs(tempDate);
                if (!bsView) return;
                let y = bsView.year;
                let m = bsView.month;
                let day = bsView.date;

                if (part === 'year') y = val;
                if (part === 'month') m = val;
                if (part === 'day') day = val;

                const maxDays = getBsDaysInMonth(y, m);
                if (day > maxDays) day = maxDays;

                const newAdDate = bsToAd(y, m, day);
                if (newAdDate) {
                    setTempDate(newAdDate);
                }

                const yIdx = mobileYears.indexOf(y);
                if (part === 'year' && yearRef.current && yIdx !== -1) yearRef.current.scrollTo({ top: yIdx * 32, behavior: 'smooth' });
                if (part === 'month' && monthRef.current) monthRef.current.scrollTo({ top: m * 32, behavior: 'smooth' });
                if (part === 'day' && dayRef.current) dayRef.current.scrollTo({ top: (day - 1) * 32, behavior: 'smooth' });

                if (part !== 'day' && bsView.date > maxDays && dayRef.current) {
                    dayRef.current.scrollTo({ top: (maxDays - 1) * 32, behavior: 'smooth' });
                }
            } else {
                const d = new Date(tempDate);
                let targetDay = d.getDate();

                if (part === 'year') d.setFullYear(val);
                if (part === 'month') d.setMonth(val);
                if (part === 'day') { d.setDate(val); targetDay = val; }

                const maxDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
                if (targetDay > maxDays) d.setDate(maxDays);

                setTempDate(d);

                const yIdx = mobileYears.indexOf(val);
                if (part === 'year' && yearRef.current && yIdx !== -1) yearRef.current.scrollTo({ top: yIdx * 32, behavior: 'smooth' });
                if (part === 'month' && monthRef.current) monthRef.current.scrollTo({ top: val * 32, behavior: 'smooth' });
                if (part === 'day' && dayRef.current) dayRef.current.scrollTo({ top: (val - 1) * 32, behavior: 'smooth' });

                if (part !== 'day' && targetDay > maxDays && dayRef.current) {
                    dayRef.current.scrollTo({ top: (maxDays - 1) * 32, behavior: 'smooth' });
                }
            }
        };

        const handleWheelScroll = (e, part, arr) => {
            if (Date.now() - openTimeRef.current < 500) return;

            const top = e.target.scrollTop;
            const activeIdx = Math.round(top / 32);
            if (activeIdx >= 0 && activeIdx < arr.length) {
                const newVal = arr[activeIdx];
                if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                scrollTimeoutRef.current = setTimeout(() => {
                    if (activeMode === 'BS') {
                        const bsView = adToBs(tempDate);
                        if (!bsView) return;
                        let y = bsView.year;
                        let m = bsView.month;
                        let day = bsView.date;

                        if (part === 'year') y = newVal;
                        if (part === 'month') m = newVal;
                        if (part === 'day') day = newVal;

                        const maxDays = getBsDaysInMonth(y, m);
                        if (day > maxDays) day = maxDays;

                        const newDate = bsToAd(y, m, day);
                        if (newDate && tempDate.getTime() !== newDate.getTime()) {
                            setTempDate(newDate);
                        }

                        if (part !== 'day' && bsView.date > maxDays && dayRef.current) {
                            dayRef.current.scrollTo({ top: (maxDays - 1) * 32, behavior: 'smooth' });
                        }
                    } else {
                        let y = tempDate.getFullYear();
                        let m = tempDate.getMonth();
                        let day = tempDate.getDate();

                        if (part === 'year') y = newVal;
                        if (part === 'month') m = newVal;
                        if (part === 'day') day = newVal;

                        const maxDays = new Date(y, m + 1, 0).getDate();
                        if (day > maxDays) day = maxDays;

                        const newDate = new Date(y, m, day);
                        newDate.setHours(tempDate.getHours(), tempDate.getMinutes(), tempDate.getSeconds(), tempDate.getMilliseconds());

                        if (tempDate.getTime() !== newDate.getTime()) {
                            setTempDate(newDate);
                        }

                        if (part !== 'day' && tempDate.getDate() > maxDays && dayRef.current) {
                            dayRef.current.scrollTo({ top: (maxDays - 1) * 32, behavior: 'smooth' });
                        }
                    }
                }, 150);
            }
        };

        const getMobilePreviewText = () => {
            if (activeMode === 'BS') {
                const bsView = adToBs(tempDate);
                if (!bsView) return '';
                const mName = getMonthName(bsView.month, 'BS', false);
                return `${bsView.date.toString().padStart(2, '0')} ${mName} ${bsView.year}`;
            }
            return format(tempDate, 'dd MMMM yyyy');
        };

        const getMobileSecondaryPreviewText = () => {
            if (activeMode === 'BS') {
                return `(${format(tempDate, 'dd MMMM yyyy')} AD)`;
            } else {
                const bsView = adToBs(tempDate);
                if (!bsView) return '';
                const mName = getMonthName(bsView.month, 'BS', false);
                return `(${bsView.date.toString().padStart(2, '0')} ${mName} ${bsView.year} BS)`;
            }
        };

        return (
            <div className="mobile-scroll-picker">
                <div className="mobile-header">
                    <h3>Select Date</h3>
                    <span className="selected-preview">{getMobilePreviewText()}</span>
                    <span className="selected-preview subtitle-muted" style={{ display: 'block', marginTop: '2px' }}>
                        {getMobileSecondaryPreviewText()}
                    </span>
                </div>
                <div className="scroll-columns" style={{ touchAction: 'pan-y' }}>
                    <div className="scroll-col year-col" ref={yearRef} onScroll={(e) => handleWheelScroll(e, 'year', mobileYears)}>
                        {mobileYears.map(y => (
                            <div
                                key={y}
                                className={`scroll-item ${(activeMode === 'BS' ? (adToBs(tempDate) ? adToBs(tempDate).year === y : false) : tempDate.getFullYear() === y)
                                    ? 'selected'
                                    : ''
                                    }`}
                                onClick={() => updateDate('year', y)}
                            >
                                {y}
                            </div>
                        ))}
                    </div>
                    <div className="scroll-col month-col" ref={monthRef} onScroll={(e) => handleWheelScroll(e, 'month', mobileMonths.map((_, i) => i))}>
                        {mobileMonths.map((m, i) => (
                            <div
                                key={m}
                                className={`scroll-item ${(activeMode === 'BS' ? (adToBs(tempDate) ? adToBs(tempDate).month === i : false) : tempDate.getMonth() === i)
                                    ? 'selected'
                                    : ''
                                    }`}
                                onClick={() => updateDate('month', i)}
                            >
                                {m}
                            </div>
                        ))}
                    </div>
                    <div className="scroll-col day-col" ref={dayRef} onScroll={(e) => handleWheelScroll(e, 'day', daysArr)}>
                        {daysArr.map(d => (
                            <div
                                key={d}
                                className={`scroll-item ${(activeMode === 'BS' ? (adToBs(tempDate) ? adToBs(tempDate).date === d : false) : tempDate.getDate() === d)
                                    ? 'selected'
                                    : ''
                                    }`}
                                onClick={() => updateDate('day', d)}
                            >
                                {d}
                            </div>
                        ))}
                    </div>
                </div>
                <button type="button" className="confirm-btn" onClick={handleConfirm}>Confirm</button>
            </div>
        );
    };

    const renderToggle = () => {
        // Hide the toggle if displayMode is explicitly locked by parent
        if (propDisplayMode) return null;

        return (
            <div className="calendar-mode-toggle-bar">
                <div className="mode-toggle-buttons">
                    <button
                        type="button"
                        className={`mode-toggle-btn ${activeMode === 'AD' ? 'active' : ''}`}
                        onClick={() => handleModeToggle('AD')}
                    >
                        AD
                    </button>
                    <button
                        type="button"
                        className={`mode-toggle-btn ${activeMode === 'BS' ? 'active' : ''}`}
                        onClick={() => handleModeToggle('BS')}
                    >
                        BS
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className={`datepicker-wrapper ${themeClass}`} ref={pickerRef}>
            <SharedInput
                icon={CalendarIcon}
                value={inputValue}
                onChange={handleInputChange}
                onToggle={toggleOpen}
                placeholder={placeholder}
                mask="date"
                onFocus={() => {
                    setIsFocused(true);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    if (onBlur) onBlur({ target: name ? { name, value: inputValue } : { value: inputValue } });
                }}
                onClear={() => {
                    setInputValue('');
                    triggerChange(null);
                }}
                disabled={disabled}
            />
            <AnimatePresence>
                {isOpen && (
                    <>
                        {isMobile ? createPortal(
                            <div className={`datepicker-mobile-portal ${themeClass}`}>
                                <motion.div
                                    className="mobile-backdrop"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsOpen(false)}
                                />
                                <motion.div
                                    initial={{ y: '100%', opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: '100%', opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="picker-dropdown glass-card mobile"
                                >
                                    {renderToggle()}
                                    {renderMobilePicker()}
                                </motion.div>
                            </div>,
                            document.body
                        ) : createPortal(
                            <div className={`datepicker-wrapper ${themeClass}`} style={portalStyle}>
                                <motion.div
                                    ref={dropdownRef}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 10, opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="picker-dropdown glass-card desktop"
                                >
                                    {renderToggle()}
                                    {renderCalendar()}
                                </motion.div>
                            </div>,
                            document.body
                        )}
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DatePicker;
