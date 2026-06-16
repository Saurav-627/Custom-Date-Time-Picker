import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { DatePicker, TimePicker } from './components'
import './App.css'

function Showcase() {
  const [selectedDate, setSelectedDate] = useState('2024-03-02') // Use standard string now
  const [selectedTime, setSelectedTime] = useState('11:00') // Use standard 24h string
  const [selectedTimeWithSeconds, setSelectedTimeWithSeconds] = useState('11:05:00')

  return (
    <main className="app-container">
      <header className="hero">
        <h1 className="title">Premium Pickers</h1>
        <p className="subtitle">Responsive Custom Date & Time Selectors</p>
        <Link to="/simple" className="demo-link" style={{ marginTop: '16px', display: 'inline-block', color: 'var(--primary)', textDecoration: 'underline' }}>
          Go to Simple Form View
        </Link>
      </header>

      <div className="showcase glass-card">
        <section className="picker-section">
          <h2>Date Selection & Calendar Modes</h2>
          <p>Calendar for desktop, scroll wheels for mobile. Fully supports AD/BS modes.</p>
          
          <div className="picker-demo" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="demo-controls" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', background: 'var(--hover-overlay)', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Default calendarMode</label>
                <select 
                  value={window.__demoCalMode || 'AD'} 
                  onChange={(e) => {
                    window.__demoCalMode = e.target.value;
                    // Force refresh Showcase state
                    setSelectedDate(selectedDate);
                  }}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  <option value="AD">AD (Gregorian)</option>
                  <option value="BS">BS (Bikram Sambat)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>outputMode</label>
                <select 
                  value={window.__demoOutMode || 'AD'} 
                  onChange={(e) => {
                    window.__demoOutMode = e.target.value;
                    if (window.__demoOutMode === 'BS') {
                      setSelectedDate('2080-05-24');
                    } else if (window.__demoOutMode === 'AD') {
                      setSelectedDate('2023-09-10');
                    } else {
                      setSelectedDate(window.__demoCalMode === 'BS' ? '2080-05-24' : '2023-09-10');
                    }
                  }}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  <option value="AD">AD (Gregorian YYYY-MM-DD)</option>
                  <option value="BS">BS (Bikram Sambat YYYY-MM-DD)</option>
                  <option value="selection">Selection (Matches Active Calendar Mode)</option>
                </select>
              </div>
            </div>

            <DatePicker
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="Select Date"
              calendarMode={window.__demoCalMode || 'AD'}
              outputMode={window.__demoOutMode || 'AD'}
            />
            {selectedDate && (
              <div className="status-badge">
                Selected (Output Value): <code style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{selectedDate}</code>
              </div>
            )}
          </div>
        </section>

        <section className="picker-section">
          <h2>Time Selection</h2>
          <p>Grid for desktop, scroll wheels for mobile. Features <b>AM/PM & Seconds</b>.</p>
          <div className="picker-demo">
            <h4>12h Format (HH:MM AM/PM)</h4>
            <TimePicker
              use12h={true}
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              placeholder="Standard Time"
            />

            <h4 style={{ marginTop: '20px' }}>With Seconds (HH:MM:SS AM/PM)</h4>
            <TimePicker
              use12h={true}
              showSeconds={true}
              value={selectedTimeWithSeconds}
              onChange={(e) => setSelectedTimeWithSeconds(e.target.value)}
              placeholder="Precision Time"
            />
          </div>
        </section>
      </div>

      <footer className="info">
        <p>Built with Vite + React + Framer Motion</p>
        <div className="features">
          <span>📱 Mobile Optimized</span>
          <span>🖥️ Desktop Ready</span>
          <span>⌨️ Typeable Input</span>
        </div>
      </footer>
    </main>
  )
}

function SimpleForm() {
  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');

  return (
    <div className="simple-wrapper" style={{ padding: '40px 20px', maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Link to="/" style={{ color: 'var(--text-dim)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        ← Back to Showcase
      </Link>

      <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text)', marginLeft: '4px' }}>Date of Birth</label>
        <DatePicker
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="YYYY/MM/DD"
        />
      </div>

      <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text)', marginLeft: '4px' }}>Meeting Time</label>
        <TimePicker
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="HH:MM AM/PM"
        />
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  // We use useLocation just to trigger re-renders if needed, but Routes handles it

  return (
    <Routes>
      <Route path="/" element={<Showcase />} />
      <Route path="/simple" element={<SimpleForm />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
