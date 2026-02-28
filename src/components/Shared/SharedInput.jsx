import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import './SharedInput.css';

/**
 * Shared input field for Date/Time Pickers
 * @param {string} icon The icon component to show
 * @param {string} value The current value
 * @param {function} onChange Callback for value change
 * @param {function} onIconClick Callback for icon click
 * @param {string} placeholder Placeholder text
 */
const SharedInput = ({ icon: Icon, value, onChange, onIconClick, placeholder, error, onClear }) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);

    return (
        <div className={`input-container glass-card ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
            <div className="input-icon-wrapper" onClick={onIconClick}>
                <Icon size={18} className="input-icon" />
            </div>

            <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                className="shared-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            {value && onClear && (
                <button className="clear-btn" onClick={onClear}>
                    <X size={14} />
                </button>
            )}
        </div>
    );
};

export default SharedInput;
