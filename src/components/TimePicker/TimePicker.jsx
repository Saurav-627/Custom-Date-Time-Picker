import React, { useState, useRef, useEffect } from 'react';
import { Clock as ClockIcon, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SharedInput from '../Shared/SharedInput';
import { useMobile } from '../../hooks/useMediaQuery';
import './TimePicker.css';

const TimePicker = ({
    value,
    onChange,
    placeholder = "HH/MM AM/PM",
    showSeconds = false,
    use12h = true,
    name,
    onBlur,
    disabled = false
}) => {
    const isMobile = useMobile();
    const [isOpen, setIsOpen] = useState(false);

    const convertTo24h = (timeStr) => {
        if (!timeStr) return '';
        const parts = timeStr.split(' ');
        if (parts.length < 2 && use12h) return timeStr;
        if (!use12h) return timeStr;

        const timeParts = parts[0].split(':');
        let hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1] || '00';
        const seconds = timeParts[2] || '00';
        const modifier = parts[1] || 'AM';

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        let res = `${hours.toString().padStart(2, '0')}:${minutes}`;
        if (showSeconds) res += `:${seconds}`;
        return res;
    };

    const convertToDisplay = (timeStr) => {
        if (!timeStr) return '';
        if (use12h && (timeStr.includes('AM') || timeStr.includes('PM'))) return timeStr;
        if (!use12h) return timeStr;

        const parts = timeStr.split(':');
        if (parts.length < 2) return timeStr;

        let hours = parseInt(parts[0], 10);
        const minutes = parts[1] || '00';
        const seconds = parts[2] || '00';
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12 || 12;
        let res = `${hours.toString().padStart(2, '0')}:${minutes}`;
        if (showSeconds) res += `:${seconds}`;
        res += ` ${ampm}`;
        return res;
    };

    const triggerChange = (timeStr) => {
        const val24h = convertTo24h(timeStr);
        if (onChange) {
            onChange({
                target: {
                    name: name,
                    value: val24h
                }
            });
        }
    };

    const [inputValue, setInputValue] = useState(convertToDisplay(value) || '');
    const [tempValue, setTempValue] = useState(convertToDisplay(value) || '');
    const [isFocused, setIsFocused] = useState(false);
    const pickerRef = useRef(null);

    const hourRef = useRef(null);
    const minRef = useRef(null);
    const secRef = useRef(null);
    const ampmRef = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const openTimeRef = useRef(0);

    const hoursArr = use12h ? Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')) : Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutesArr = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const secondsArr = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const ampmArr = ['AM', 'PM'];

    useEffect(() => {
        if (!isFocused && !isOpen) {
            const displayValue = convertToDisplay(value);
            setInputValue(displayValue || '');
            setTempValue(displayValue || '');
        }
    }, [value, isFocused, isOpen]);

    useEffect(() => {
        if (isOpen && isMobile) {
            let fallbackTime = "01:00";
            if (showSeconds) fallbackTime += ":00";
            if (use12h) fallbackTime += " AM";

            const current = convertToDisplay(tempValue) || fallbackTime;
            const fullTimeParts = current.split(' ');
            const parts = fullTimeParts[0].split(':');
            const currentAmPm = fullTimeParts[1] || 'AM';

            const syncScrolls = () => {
                const hIdx = hoursArr.indexOf(parts[0]);
                if (hourRef.current && hIdx !== -1) hourRef.current.scrollTop = hIdx * 32;
                if (minRef.current) minRef.current.scrollTop = parseInt(parts[1] || 0) * 32;
                if (secRef.current && showSeconds) secRef.current.scrollTop = parseInt(parts[2] || 0) * 32;
                if (ampmRef.current && use12h) ampmRef.current.scrollTop = ampmArr.indexOf(currentAmPm) * 32;
            };

            syncScrolls();
            const t1 = setTimeout(syncScrolls, 50);
            const t2 = setTimeout(syncScrolls, 300);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [isOpen, isMobile]);

    const toggleOpen = () => {
        if (disabled) return;
        if (!isOpen) {
            let defaultTime = "01:00";
            if (showSeconds) defaultTime += ":00";
            if (use12h) defaultTime += " AM";
            setTempValue(convertToDisplay(inputValue) || defaultTime);
            openTimeRef.current = Date.now();
        }
        setIsOpen(!isOpen);
    };

    const handleConfirm = () => {
        setInputValue(tempValue);
        triggerChange(tempValue);
        setIsOpen(false);
    };

    const handleInputChange = (val) => {
        setInputValue(val);
        const parts = val.split(' ');
        const timeParts = parts[0].split(':');
        if (timeParts.length >= 2) {
            const isValidLength = timeParts.every(p => p.length === 2);
            if (isValidLength) {
                if (!use12h || (use12h && parts[1] && (parts[1] === 'AM' || parts[1] === 'PM'))) {
                    triggerChange(val);
                    setTempValue(val);
                }
            }
        } else if (val === '') {
            triggerChange('');
            setTempValue('');
        }
    };

    const handleTimeSelect = (timeStr) => {
        setTempValue(timeStr);
        if (!isMobile) {
            setInputValue(timeStr);
        }
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

    const renderDesktop = () => {
        let fallbackTime = "01:00";
        if (showSeconds) fallbackTime += ":00";
        if (use12h) fallbackTime += " AM";

        const current = convertToDisplay(tempValue) || fallbackTime;
        const fullTimeParts = current.split(' ');
        const timeParts = fullTimeParts[0].split(':');
        const currentAmPm = fullTimeParts[1] || 'AM';

        const update = (h = timeParts[0] || '12', m = timeParts[1] || '00', s = timeParts[2] || '00', p = currentAmPm) => {
            let res = `${h}:${m}`;
            if (showSeconds) res += `:${s}`;
            if (use12h) res += ` ${p}`;
            handleTimeSelect(res);
        };

        return (
            <div className={`desktop-time-picker ${showSeconds ? 'with-seconds' : ''}`}>
                <div className="time-select-grid">
                    <div className="time-col">
                        <span className="col-label">Hrs</span>
                        <div className="time-scroll">
                            {hoursArr.map(h => (
                                <button type="button" key={h} className={`time-btn ${timeParts[0] === h ? 'active' : ''}`} onClick={() => update(h)}>
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="time-col">
                        <span className="col-label">Min</span>
                        <div className="time-scroll">
                            {minutesArr.map(m => (
                                <button type="button" key={m} className={`time-btn ${timeParts[1] === m ? 'active' : ''}`} onClick={() => update(undefined, m)}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    {showSeconds && (
                        <div className="time-col">
                            <span className="col-label">Sec</span>
                            <div className="time-scroll">
                                {secondsArr.map(s => (
                                    <button type="button" key={s} className={`time-btn ${timeParts[2] === s ? 'active' : ''}`} onClick={() => update(undefined, undefined, s)}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {use12h && (
                        <div className="time-col">
                            <span className="col-label">Mode</span>
                            <div className="time-scroll">
                                {ampmArr.map(p => (
                                    <button type="button" key={p} className={`time-btn ${currentAmPm === p ? 'active' : ''}`} onClick={() => update(undefined, undefined, undefined, p)}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="desktop-footer">
                    <button type="button" className="confirm-btn small" onClick={handleConfirm}>
                        <Check size={16} style={{ marginRight: '6px' }} /> Done
                    </button>
                </div>
            </div>
        );
    };

    const renderMobileGrid = () => {
        let fallbackTime = "01:00";
        if (showSeconds) fallbackTime += ":00";
        if (use12h) fallbackTime += " AM";

        const current = convertToDisplay(tempValue) || fallbackTime;
        const fullTimeParts = current.split(' ');
        const parts = fullTimeParts[0].split(':');
        const currentAmPm = fullTimeParts[1] || 'AM';

        const updatePart = (index, val) => {
            const newParts = [...parts];
            while (newParts.length < (showSeconds ? 3 : 2)) newParts.push('00');
            newParts[index] = val;
            let timeStr = newParts.slice(0, showSeconds ? 3 : 2).join(':');
            if (use12h) timeStr += ` ${currentAmPm}`;
            handleTimeSelect(timeStr);

            if (index === 0 && hourRef.current) hourRef.current.scrollTo({ top: hoursArr.indexOf(val) * 32, behavior: 'smooth' });
            if (index === 1 && minRef.current) minRef.current.scrollTo({ top: minutesArr.indexOf(val) * 32, behavior: 'smooth' });
            if (index === 2 && secRef.current) secRef.current.scrollTo({ top: secondsArr.indexOf(val) * 32, behavior: 'smooth' });
        };

        const updateAmPm = (val) => {
            let timeStr = parts.slice(0, showSeconds ? 3 : 2).join(':');
            if (use12h) timeStr += ` ${val}`;
            handleTimeSelect(timeStr);

            if (ampmRef.current) ampmRef.current.scrollTo({ top: ampmArr.indexOf(val) * 32, behavior: 'smooth' });
        };

        const handleWheelScroll = (e, type, index, arr) => {
            if (Date.now() - openTimeRef.current < 500) return;

            const top = e.target.scrollTop;
            const activeIdx = Math.round(top / 32);
            if (activeIdx >= 0 && activeIdx < arr.length) {
                const newVal = arr[activeIdx];
                if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                scrollTimeoutRef.current = setTimeout(() => {
                    if (type === 'part') {
                        if (parts[index] !== newVal) updatePart(index, newVal);
                    } else if (type === 'ampm') {
                        if (currentAmPm !== newVal) updateAmPm(newVal);
                    }
                }, 150);
            }
        };

        return (
            <div className="mobile-scroll-picker">
                <div className="mobile-header">
                    <h3>Select Time</h3>
                    <span className="selected-preview">{tempValue || '--:--'}</span>
                </div>
                <div className="scroll-columns" style={{ touchAction: 'pan-y' }}>
                    <div className="scroll-col hour-col" ref={hourRef} onScroll={(e) => handleWheelScroll(e, 'part', 0, hoursArr)}>
                        {hoursArr.map(h => (
                            <div key={h} className={`scroll-item ${parts[0] === h ? 'selected' : ''}`} onClick={() => updatePart(0, h)}>
                                {h}
                            </div>
                        ))}
                    </div>
                    <div className="scroll-col min-col" ref={minRef} onScroll={(e) => handleWheelScroll(e, 'part', 1, minutesArr)}>
                        {minutesArr.map(m => (
                            <div key={m} className={`scroll-item ${parts[1] === m ? 'selected' : ''}`} onClick={() => updatePart(1, m)}>
                                {m}
                            </div>
                        ))}
                    </div>
                    {showSeconds && (
                        <div className="scroll-col sec-col" ref={secRef} onScroll={(e) => handleWheelScroll(e, 'part', 2, secondsArr)}>
                            {secondsArr.map(s => (
                                <div key={s} className={`scroll-item ${parts[2] === s ? 'selected' : ''}`} onClick={() => updatePart(2, s)}>
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                    {use12h && (
                        <div className="scroll-col ampm-col" ref={ampmRef} onScroll={(e) => handleWheelScroll(e, 'ampm', null, ampmArr)}>
                            {ampmArr.map(p => (
                                <div key={p} className={`scroll-item ${currentAmPm === p ? 'selected' : ''}`} onClick={() => updateAmPm(p)}>
                                    {p}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button type="button" className="confirm-btn" onClick={handleConfirm}>Confirm</button>
            </div>
        );
    };

    return (
        <div className="timepicker-wrapper" ref={pickerRef}>
            <SharedInput
                icon={ClockIcon}
                value={inputValue}
                onChange={handleInputChange}
                onToggle={toggleOpen}
                placeholder={showSeconds ? "HH:MM:SS AM/PM" : "HH:MM AM/PM"}
                mask={showSeconds ? (use12h ? 'time-seconds-ampm' : 'time-seconds') : (use12h ? 'time-ampm' : 'time')}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                    setIsFocused(false);
                    if (onBlur) onBlur({ target: { name, value: inputValue } });
                }}
                onClear={() => {
                    setInputValue('');
                    setTempValue('');
                    triggerChange('');
                }}
                disabled={disabled}
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
                            {isMobile ? renderMobileGrid() : renderDesktop()}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimePicker;
