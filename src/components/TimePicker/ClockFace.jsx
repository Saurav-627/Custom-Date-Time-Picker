import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './ClockFace.css';

const ClockFace = ({ value, onChange, onConfirm }) => {
    const [view, setView] = useState('hours'); // hours or minutes
    const [selectedHour, setSelectedHour] = useState(value ? value.split(':')[0] : '12');
    const [selectedMinute, setSelectedMinute] = useState(value ? value.split(':')[1] : '00');

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

    const handlePick = (item) => {
        if (view === 'hours') {
            setSelectedHour(item.padStart(2, '0'));
            setView('minutes');
        } else {
            setSelectedMinute(item);
            onChange(`${selectedHour}:${item}`);
        }
    };

    const getPos = (index, total) => {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        const r = 110; // radius
        return {
            left: `calc(50% + ${Math.cos(angle) * r}px)`,
            top: `calc(50% + ${Math.sin(angle) * r}px)`,
        };
    };

    return (
        <div className="clock-face">
            <div className="clock-display">
                <span className={view === 'hours' ? 'active' : ''} onClick={() => setView('hours')}>{selectedHour}</span>
                :
                <span className={view === 'minutes' ? 'active' : ''} onClick={() => setView('minutes')}>{selectedMinute}</span>
            </div>

            <div className="clock-dial">
                <div className="center-dot" />
                <motion.div
                    className="clock-hand"
                    animate={{ rotate: (view === 'hours' ? parseInt(selectedHour) * 30 : parseInt(selectedMinute) * 6) }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                />

                {(view === 'hours' ? hours : minutes).map((item, i) => (
                    <button
                        key={item}
                        className={`clock-number ${((view === 'hours' ? selectedHour : selectedMinute) === item.padStart(2, '0')) ? 'active' : ''}`}
                        style={getPos(i + 1, 12)}
                        onClick={() => handlePick(item)}
                    >
                        {item}
                    </button>
                ))}
            </div>

            <div className="clock-actions">
                <button className="confirm-btn" onClick={onConfirm}>Confirm Time</button>
            </div>
        </div>
    );
};

export default ClockFace;
