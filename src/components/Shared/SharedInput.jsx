import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import './SharedInput.css';

const SharedInput = ({
    icon: Icon,
    value,
    onChange,
    onToggle,
    placeholder,
    error,
    onClear,
    mask,
    onFocus: externalOnFocus,
    onBlur: externalOnBlur
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [dropDirection, setDropDirection] = useState('down');
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const checkPosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            if (spaceBelow < 350 && spaceAbove > spaceBelow) {
                setDropDirection('up');
            } else {
                setDropDirection('down');
            }
        }
    };

    const handleToggle = (e) => {
        if (e) e.stopPropagation();
        checkPosition();
        onToggle();
    };

    const validatePart = (part, type) => {
        const val = parseInt(part, 10);
        if (isNaN(val)) return part;

        if (type === 'month') return Math.min(Math.max(val, 1), 12).toString().padStart(2, '0');
        if (type === 'day') return Math.min(Math.max(val, 1), 31).toString().padStart(2, '0');
        if (type === 'hour') return Math.min(Math.max(val, 0), 23).toString().padStart(2, '0');
        if (type === 'hour12') return Math.min(Math.max(val, 1), 12).toString().padStart(2, '0');
        if (type === 'minsec') return Math.min(Math.max(val, 0), 59).toString().padStart(2, '0');
        return part;
    };

    const formatValue = (val) => {
        if (!mask) return val;

        // Date Mask: YYYY/MM/DD
        if (mask === 'date') {
            const clean = val.replace(/[^0-9]/g, '');
            let Y = clean.substring(0, 4);
            let M = clean.substring(4, 6);
            let D = clean.substring(6, 8);

            // Auto-pad separators if digits are complete
            let res = Y;
            if (clean.length > 4) {
                if (M.length === 2) M = validatePart(M, 'month');
                res += '/' + M;
            } else if (clean.length === 4 && val.length === 4) {
                res += '/';
            }

            if (clean.length > 6) {
                if (D.length === 2) D = validatePart(D, 'day');
                res += '/' + D;
            } else if (clean.length === 6 && val.length === 7) {
                res += '/';
            }
            return res;
        }

        // Time Mask: HH:MM:SS AM/PM
        if (mask.includes('time')) {
            const is12h = mask.endsWith('-ampm');
            const hasSeconds = mask.includes('seconds');

            // Clean out everything except digits and A/P
            const digitClean = val.replace(/[^0-9]/g, '');
            const ampmMatch = val.toLowerCase().match(/[ap]/);
            let ampm = '';
            if (is12h && ampmMatch) {
                ampm = ampmMatch[0] === 'a' ? 'AM' : 'PM';
            }

            let H = digitClean.substring(0, 2);
            let M = digitClean.substring(2, 4);
            let S = digitClean.substring(4, 6);

            // Logic for HH:MM[:SS]
            let res = H;
            if (digitClean.length >= 2) {
                if (H.length === 2) H = validatePart(H, is12h ? 'hour12' : 'hour');
                res = H + ':';

                if (digitClean.length > 2) {
                    let M = digitClean.substring(2, 4);
                    if (M.length === 2) M = validatePart(M, 'minsec');
                    res += M;

                    if (digitClean.length >= 4) {
                        if (hasSeconds) {
                            res += ':';
                            if (digitClean.length > 4) {
                                let S = digitClean.substring(4, 6);
                                if (S.length === 2) S = validatePart(S, 'minsec');
                                res += S;

                                if (digitClean.length >= 6 && is12h) {
                                    res += ' ' + (ampm || '');
                                }
                            }
                        } else if (is12h) {
                            res += ' ' + (ampm || '');
                        }
                    }
                }
            }

            // If user typed 'a' or 'p' anywhere, ensure it shows up correctly even if digits are incomplete
            if (is12h && ampm && !res.includes(ampm)) {
                if (!res.includes(' ')) res += ' ';
                res += ampm;
            }

            return res.trimEnd();
        }

        return val;
    };

    const handleChange = (e) => {
        const raw = e.target.value;
        const formatted = formatValue(raw);
        onChange(formatted);
    };

    return (
        <div
            ref={containerRef}
            className={`input-container glass-card ${isFocused ? 'focused' : ''} ${error ? 'error' : ''} drop-${dropDirection}`}
            onClick={handleToggle}
        >
            <div className="input-icon-wrapper">
                <Icon size={18} className="input-icon" />
            </div>

            <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                className="shared-input"
                value={value}
                onChange={handleChange}
                onFocus={(e) => {
                    setIsFocused(true);
                    checkPosition();
                    if (externalOnFocus) externalOnFocus(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    if (externalOnBlur) externalOnBlur(e);
                }}
                onClick={(e) => { e.stopPropagation(); }}
            />

            {value && onClear && (
                <button className="clear-btn" onClick={(e) => { e.stopPropagation(); onClear(); }}>
                    <X size={14} />
                </button>
            )}
        </div>
    );
};

export default SharedInput;
