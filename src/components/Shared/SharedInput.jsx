import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { useMobile } from '../../hooks/useMediaQuery';
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
    onBlur: externalOnBlur,
    disabled = false
}) => {
    const isMobile = useMobile();
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
        if (disabled) return;
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

        // Date Mask: YYYY/MM/DD (Section-based tracking)
        if (mask === 'date') {
            const separator = val.includes('-') ? '-' : '/';
            const parts = val.split(/[\/-]/);
            
            let yDigits = (parts[0] || '').replace(/[^0-9]/g, '');
            let mDigits = (parts[1] || '').replace(/[^0-9]/g, '');
            let dDigits = (parts[2] || '').replace(/[^0-9]/g, '');

            // Carry over excess characters to avoid overflow but support natural typing flow
            if (yDigits.length > 4) {
                mDigits = yDigits.substring(4) + mDigits;
                yDigits = yDigits.substring(0, 4);
            }
            if (mDigits.length > 2) {
                dDigits = mDigits.substring(2) + dDigits;
                mDigits = mDigits.substring(0, 2);
            }
            if (dDigits.length > 2) {
                dDigits = dDigits.substring(0, 2);
            }

            // Perform range validation on completed sections
            if (mDigits.length === 2) mDigits = validatePart(mDigits, 'month');
            if (dDigits.length === 2) dDigits = validatePart(dDigits, 'day');

            // Reconstruct the formatted date string segment by segment
            let res = yDigits;
            const hasMonth = parts.length > 1;
            if (hasMonth || yDigits.length === 4) {
                res += separator;
                if (mDigits) res += mDigits;
            }

            const hasDay = parts.length > 2;
            if (hasDay || (mDigits.length === 2 && hasMonth)) {
                res += separator;
                if (dDigits) res += dDigits;
            }

            return res;
        }

        // Time Mask: HH:MM:SS AM/PM (Section-based tracking)
        if (mask.includes('time')) {
            const is12h = mask.endsWith('-ampm');
            const hasSeconds = mask.includes('seconds');

            // Clean irrelevant symbols, keeping potential AM/PM triggers
            const cleanRaw = val.replace(/[^0-9apAP:\s]/g, '');
            const parts = cleanRaw.split(/[:\s]+/);

            let ampm = '';
            const ampmMatch = val.toLowerCase().match(/[ap]/);
            if (is12h && ampmMatch) {
                ampm = ampmMatch[0] === 'a' ? 'AM' : 'PM';
            }

            const numParts = parts.filter(p => /^[0-9]+$/.test(p));
            let hDigits = (numParts[0] || '').substring(0, 2);
            let mDigits = (numParts[1] || '').substring(0, 2);
            let sDigits = (numParts[2] || '').substring(0, 2);

            // Validate segments
            if (hDigits.length === 2) hDigits = validatePart(hDigits, is12h ? 'hour12' : 'hour');
            if (mDigits.length === 2) mDigits = validatePart(mDigits, 'minsec');
            if (sDigits.length === 2) sDigits = validatePart(sDigits, 'minsec');

            // Reconstruct the formatted time string segment by segment
            let res = hDigits;
            const hasMin = numParts.length > 1;
            if (hasMin || hDigits.length === 2) {
                res += ':';
                if (mDigits) res += mDigits;
            }

            if (hasSeconds) {
                const hasSec = numParts.length > 2;
                if (hasSec || (mDigits.length === 2 && hasMin)) {
                    res += ':';
                    if (sDigits) res += sDigits;
                }
            }

            if (is12h) {
                const isComplete = hasSeconds ? (sDigits.length === 2) : (mDigits.length === 2);
                if (ampm) {
                    res += ' ' + ampm;
                } else if (isComplete && val.endsWith(' ')) {
                    res += ' ';
                }
            }

            return res;
        }

        return val;
    };

    const handleChange = (e) => {
        if (disabled) return;
        const input = e.target;
        const raw = input.value;
        const selectionStart = input.selectionStart;

        const formatted = formatValue(raw);
        onChange(formatted);

        // Stabilize cursor position in the next render cycle to prevent jumps to the end of input
        requestAnimationFrame(() => {
            if (input && selectionStart !== null) {
                const diff = formatted.length - raw.length;
                const newPos = Math.max(0, selectionStart + diff);
                input.setSelectionRange(newPos, newPos);
            }
        });
    };

    return (
        <div
            ref={containerRef}
            className={`input-container glass-card ${isFocused ? 'focused' : ''} ${error ? 'error' : ''} ${disabled ? 'disabled' : ''} drop-${dropDirection}`}
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
                readOnly={isMobile || disabled}
                onFocus={(e) => {
                    if (disabled) return;
                    setIsFocused(true);
                    checkPosition();
                    if (externalOnFocus) externalOnFocus(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    if (externalOnBlur) externalOnBlur(e);
                }}
                onClick={(e) => {
                    if (disabled) {
                        e.stopPropagation();
                        return;
                    }
                    if (isMobile) {
                        handleToggle(e);
                    } else {
                        e.stopPropagation();
                    }
                }}
            />

            {!disabled && value && onClear && (
                <button type="button" className="clear-btn" onClick={(e) => { e.stopPropagation(); onClear(); }}>
                    <X size={14} />
                </button>
            )}
        </div>
    );
};

export default SharedInput;
