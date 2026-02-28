import React, { useState, useRef, useEffect } from 'react';
import { Clock as ClockIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SharedInput from '../Shared/SharedInput';
import { useMobile } from '../../hooks/useMediaQuery';
import ClockFace from './ClockFace';
import './TimePicker.css';

const TimePicker = ({ value, onChange, placeholder = "Select Time" }) => {
    const isMobile = useMobile();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');
    const pickerRef = useRef(null);

    useEffect(() => {
        if (value) setInputValue(value);
    }, [value]);

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleInputChange = (val) => {
        setInputValue(val);
        const timeMatch = val.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
        if (timeMatch) onChange(val);
    };

    const handleTimeSelect = (timeStr) => {
        setInputValue(timeStr);
        onChange(timeStr);
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

    const renderDesktop = () => {
        const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
        const minutes = ['00', '15', '30', '45'];

        return (
            <div className="desktop-time-picker">
                <div className="time-select-grid">
                    <div className="time-col">
                        <span className="col-label">Hours</span>
                        <div className="time-scroll">
                            {hours.map(h => (
                                <button key={h} className={`time-btn ${inputValue.startsWith(h) ? 'active' : ''}`} onClick={() => handleTimeSelect(`${h}:${inputValue.split(':')[1] || '00'}`)}>
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="time-col">
                        <span className="col-label">Minutes</span>
                        <div className="time-scroll">
                            {minutes.map(m => (
                                <button key={m} className={`time-btn ${inputValue.endsWith(m) ? 'active' : ''}`} onClick={() => handleTimeSelect(`${inputValue.split(':')[0] || '12'}:${m}`)}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="timepicker-wrapper" ref={pickerRef}>
            <SharedInput
                icon={ClockIcon}
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`picker-dropdown glass-card ${isMobile ? 'mobile-time' : 'desktop-time'}`}
                    >
                        {isMobile ? (
                            <div className="mobile-clock-container">
                                <h3>Pick Time</h3>
                                <ClockFace value={inputValue} onChange={handleTimeSelect} onConfirm={() => setIsOpen(false)} />
                            </div>
                        ) : (
                            renderDesktop()
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimePicker;
