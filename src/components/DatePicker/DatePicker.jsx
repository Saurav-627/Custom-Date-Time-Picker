import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parse, isValid, addMonths, subMonths, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isAfter, isBefore, isSameMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import SharedInput from '../Shared/SharedInput';
import { useMobile } from '../../hooks/useMediaQuery';
import './DatePicker.css';

const DatePicker = ({ value, onChange, placeholder = "Select Date" }) => {
    const isMobile = useMobile();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value ? format(new Date(value), 'yyyy-MM-dd') : '');
    const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
    const pickerRef = useRef(null);

    useEffect(() => {
        if (value) {
            setInputValue(format(new Date(value), 'yyyy-MM-dd'));
            setCurrentMonth(new Date(value));
        }
    }, [value]);

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleInputChange = (val) => {
        setInputValue(val);
        const parsedDate = parse(val, 'yyyy-MM-dd', new Date());
        if (isValid(parsedDate)) {
            onChange(parsedDate);
            setCurrentMonth(parsedDate);
        }
    };

    const handleDateSelect = (date) => {
        onChange(date);
        setInputValue(format(date, 'yyyy-MM-dd'));
        if (!isMobile) setIsOpen(false);
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

    // Desktop Calendar UI
    const renderCalendar = () => {
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const dateRange = eachDayOfInterval({ start, end });
        const emptyDays = Array(getDay(start)).fill(null);

        return (
            <div className="desktop-calendar">
                <div className="calendar-header">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft size={18} />
                    </button>
                    <span>{format(currentMonth, 'MMMM yyyy')}</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight size={18} />
                    </button>
                </div>
                <div className="calendar-grid">
                    {days.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
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

    // Mobile Scroll UI (Simplified demonstration, can be enhanced with list components)
    const renderMobilePicker = () => {
        const years = Array.from({ length: 100 }, (_, i) => 2024 - 50 + i);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return (
            <div className="mobile-scroll-picker">
                <h3>Select Date</h3>
                <div className="scroll-columns">
                    <div className="scroll-col year-col">
                        {years.map(y => <div key={y} className={`scroll-item ${new Date(value).getFullYear() === y ? 'selected' : ''}`}>{y}</div>)}
                    </div>
                    <div className="scroll-col month-col">
                        {months.map((m, i) => <div key={m} className={`scroll-item ${new Date(value).getMonth() === i ? 'selected' : ''}`}>{m}</div>)}
                    </div>
                    <div className="scroll-col day-col">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <div key={d} className={`scroll-item ${new Date(value).getDate() === d ? 'selected' : ''}`}>{d}</div>)}
                    </div>
                </div>
                <button className="confirm-btn" onClick={() => setIsOpen(false)}>Confirm</button>
            </div>
        );
    };

    return (
        <div className="datepicker-wrapper" ref={pickerRef}>
            <SharedInput
                icon={CalendarIcon}
                value={inputValue}
                onChange={handleInputChange}
                onIconClick={toggleOpen}
                placeholder={placeholder}
                onClear={() => {
                    setInputValue('');
                    onChange(null);
                }}
            />
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: isMobile ? 100 : 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: isMobile ? 100 : 10, scale: 0.95 }}
                        className={`picker-dropdown glass-card ${isMobile ? 'mobile' : 'desktop'}`}
                    >
                        {isMobile ? renderMobilePicker() : renderCalendar()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DatePicker;
