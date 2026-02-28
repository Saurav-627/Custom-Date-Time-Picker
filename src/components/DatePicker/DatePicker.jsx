import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, parse, isValid, addMonths, subMonths, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isAfter, isBefore, isSameMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import SharedInput from '../Shared/SharedInput';
import { useMobile } from '../../hooks/useMediaQuery';
import './DatePicker.css';

const DatePicker = ({ value, onChange, placeholder = "YYYY/MM/DD" }) => {
    const isMobile = useMobile();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('calendar');
    const [inputValue, setInputValue] = useState(value ? format(new Date(value), 'yyyy/MM/dd') : '');
    const [tempDate, setTempDate] = useState(value ? new Date(value) : new Date());
    const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
    const [isFocused, setIsFocused] = useState(false);
    const pickerRef = useRef(null);

    const yearRef = useRef(null);
    const monthRef = useRef(null);
    const dayRef = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const openTimeRef = useRef(0);

    const years = Array.from({ length: 151 }, (_, i) => new Date().getFullYear() - 100 + i);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const daysInMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate();
    const daysArr = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Sync input value with standard value if NOT focused OR closed
    useEffect(() => {
        if (!isFocused && !isOpen) {
            if (value) {
                const formatted = format(new Date(value), 'yyyy/MM/dd');
                setInputValue(formatted);
                setCurrentMonth(new Date(value));
                setTempDate(new Date(value));
            } else {
                setInputValue('');
                setTempDate(new Date());
            }
        }
    }, [value, isFocused, isOpen]);

    // Handle initial scroll on mobile open
    useEffect(() => {
        if (isOpen && isMobile) {
            const syncScrolls = () => {
                const yIdx = years.indexOf(tempDate.getFullYear());
                if (yearRef.current && yIdx !== -1) yearRef.current.scrollTop = yIdx * 32;
                if (monthRef.current) monthRef.current.scrollTop = tempDate.getMonth() * 32;
                if (dayRef.current) dayRef.current.scrollTop = (tempDate.getDate() - 1) * 32;
            };

            syncScrolls(); // Immediate sync
            const t1 = setTimeout(syncScrolls, 50);
            const t2 = setTimeout(syncScrolls, 300); // Sync again after animation finishes
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [isOpen, isMobile]);

    // Update scrolls when tempDate changes via wheel clicks (Smooth)
    useEffect(() => {
        if (isOpen && isMobile) {
            const yIdx = years.indexOf(tempDate.getFullYear());
            if (yearRef.current && Math.abs(yearRef.current.scrollTop - yIdx * 32) > 5) {
                yearRef.current.scrollTo({ top: yIdx * 32, behavior: 'smooth' });
            }
            if (monthRef.current && Math.abs(monthRef.current.scrollTop - tempDate.getMonth() * 32) > 5) {
                monthRef.current.scrollTo({ top: tempDate.getMonth() * 32, behavior: 'smooth' });
            }
            const dIdx = tempDate.getDate() - 1;
            if (dayRef.current && Math.abs(dayRef.current.scrollTop - dIdx * 32) > 5) {
                dayRef.current.scrollTo({ top: dIdx * 32, behavior: 'smooth' });
            }
        }
    }, [tempDate]);

    const toggleOpen = () => {
        if (!isOpen) {
            const dateToUse = value ? new Date(value) : new Date();
            setTempDate(dateToUse);
            setCurrentMonth(dateToUse);
            setView('calendar');
            openTimeRef.current = Date.now();
        }
        setIsOpen(!isOpen);
    };

    const handleConfirm = () => {
        onChange(tempDate);
        setInputValue(format(tempDate, 'yyyy/MM/dd'));
        setIsOpen(false);
    };

    const handleInputChange = (val) => {
        setInputValue(val);
        if (val === '') {
            onChange(null);
            setTempDate(new Date());
            return;
        }
        const parsedDate = parse(val, 'yyyy/MM/dd', new Date());
        if (isValid(parsedDate)) {
            onChange(parsedDate);
            setCurrentMonth(parsedDate);
            setTempDate(parsedDate);
        }
    };

    const handleDateSelect = (date) => {
        if (isMobile) {
            setTempDate(date);
        } else {
            onChange(date);
            setInputValue(format(date, 'yyyy/MM/dd'));
            setIsOpen(false);
        }
    };

    const handleYearSelect = (year) => {
        const newDate = new Date(currentMonth);
        newDate.setFullYear(year);
        setCurrentMonth(newDate);
        setView('calendar');
    };

    const handleMonthSelect = (monthIdx) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(monthIdx);
        setCurrentMonth(newDate);
        setView('calendar');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Prevent body scroll when mobile picker is open
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
        return (
            <div className="selector-view">
                <div className="calendar-header">
                    <span>Select Month</span>
                </div>
                <div className="grid-selector column-3">
                    {months.map((m, i) => (
                        <button
                            key={m}
                            className={`select-cell ${currentMonth.getMonth() === i ? 'active' : ''}`}
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
        const startYear = Math.floor(currentMonth.getFullYear() / 12) * 12;
        const yearsGrid = Array.from({ length: 12 }, (_, i) => startYear + i);
        return (
            <div className="selector-view">
                <div className="calendar-header">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 12 * 12))}><ChevronLeft size={16} /></button>
                    <span>Select Year</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 12 * 12))}><ChevronRight size={16} /></button>
                </div>
                <div className="grid-selector column-3">
                    {yearsGrid.map(y => (
                        <button
                            key={y}
                            className={`select-cell ${currentMonth.getFullYear() === y ? 'active' : ''}`}
                            onClick={() => handleYearSelect(y)}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderCalendar = () => {
        const displayDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const dateRange = eachDayOfInterval({ start, end });
        const emptyDays = Array(getDay(start)).fill(null);

        if (view === 'year') return renderYears();
        if (view === 'month') return renderMonths();

        return (
            <div className="desktop-calendar">
                <div className="calendar-header">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft size={18} />
                    </button>
                    <div className="header-nav">
                        <span className="nav-btn" onClick={() => setView('month')}>{format(currentMonth, 'MMMM')}</span>
                        <span className="nav-btn" onClick={() => setView('year')}>{format(currentMonth, 'yyyy')}</span>
                    </div>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight size={18} />
                    </button>
                </div>
                <div className="calendar-grid">
                    {displayDays.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
                    {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
                    {dateRange.map(date => (
                        <button
                            key={date.toString()}
                            className={`calendar-day-cell ${isSameDay(date, new Date(value)) ? 'active' : ''} ${isSameDay(date, new Date()) ? 'today' : ''}`}
                            onClick={() => handleDateSelect(date)}
                        >
                            {format(date, 'd')}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderMobilePicker = () => {
        const updateDate = (part, val) => {
            const d = new Date(tempDate);
            if (part === 'year') d.setFullYear(val);
            if (part === 'month') d.setMonth(val);
            if (part === 'day') d.setDate(val);
            setTempDate(d);
        };

        const handleWheelScroll = (e, part, arr) => {
            if (Date.now() - openTimeRef.current < 500) return; // Ignore layout scroll events during opening animation

            const top = e.target.scrollTop;
            const activeIdx = Math.round(top / 32);
            if (activeIdx >= 0 && activeIdx < arr.length) {
                const newVal = arr[activeIdx];
                if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                scrollTimeoutRef.current = setTimeout(() => {
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
                }, 150);
            }
        };

        return (
            <div className="mobile-scroll-picker">
                <div className="mobile-header">
                    <h3>Select Date</h3>
                    <span className="selected-preview">{format(tempDate, 'dd MMM yyyy')}</span>
                </div>
                <div className="scroll-columns" style={{ touchAction: 'pan-y' }}>
                    <div className="scroll-col year-col" ref={yearRef} onScroll={(e) => handleWheelScroll(e, 'year', years)}>
                        {years.map(y => (
                            <div key={y} className={`scroll-item ${tempDate.getFullYear() === y ? 'selected' : ''}`} onClick={() => updateDate('year', y)}>
                                {y}
                            </div>
                        ))}
                    </div>
                    <div className="scroll-col month-col" ref={monthRef} onScroll={(e) => handleWheelScroll(e, 'month', months.map((_, i) => i))}>
                        {months.map((m, i) => (
                            <div key={m} className={`scroll-item ${tempDate.getMonth() === i ? 'selected' : ''}`} onClick={() => updateDate('month', i)}>
                                {m}
                            </div>
                        ))}
                    </div>
                    <div className="scroll-col day-col" ref={dayRef} onScroll={(e) => handleWheelScroll(e, 'day', daysArr)}>
                        {daysArr.map(d => (
                            <div key={d} className={`scroll-item ${tempDate.getDate() === d ? 'selected' : ''}`} onClick={() => updateDate('day', d)}>
                                {d}
                            </div>
                        ))}
                    </div>
                </div>
                <button className="confirm-btn" onClick={handleConfirm}>Confirm</button>
            </div>
        );
    };

    return (
        <div className="datepicker-wrapper" ref={pickerRef}>
            <SharedInput
                icon={CalendarIcon}
                value={inputValue}
                onChange={handleInputChange}
                onToggle={toggleOpen}
                placeholder={placeholder}
                mask="date"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onClear={() => {
                    setInputValue('');
                    onChange(null);
                }}
            />
            <AnimatePresence>
                {isOpen && (
                    <>
                        {isMobile && (
                            <motion.div
                                className="mobile-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                            />
                        )}
                        <motion.div
                            initial={{ y: isMobile ? '100%' : 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: isMobile ? '100%' : 20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={`picker-dropdown glass-card ${isMobile ? 'mobile' : 'desktop'}`}
                        >
                            {isMobile ? renderMobilePicker() : renderCalendar()}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DatePicker;
