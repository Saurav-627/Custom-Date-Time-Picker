import React, { useState } from 'react'
import DatePicker from './components/DatePicker/DatePicker'
import TimePicker from './components/TimePicker/TimePicker'
import './App.css'

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('11:00 AM')
  const [selectedTimeWithSeconds, setSelectedTimeWithSeconds] = useState('11:05:00 AM')

  return (
    <main className="app-container">
      <header className="hero">
        <h1 className="title">Premium Pickers</h1>
        <p className="subtitle">Responsive Custom Date & Time Selectors</p>
      </header>

      <div className="showcase glass-card">
        <section className="picker-section">
          <h2>Date Selection</h2>
          <p>Calendar for desktop, scroll wheels for mobile. Now fixed to current date.</p>
          <div className="picker-demo">
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Select Date"
            />
            {selectedDate && (
              <div className="status-badge">
                Selected: {selectedDate.toDateString()}
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
              onChange={setSelectedTime}
              placeholder="Standard Time"
            />

            <h4 style={{ marginTop: '20px' }}>With Seconds (HH:MM:SS AM/PM)</h4>
            <TimePicker
              use12h={true}
              showSeconds={true}
              value={selectedTimeWithSeconds}
              onChange={setSelectedTimeWithSeconds}
              placeholder="Precision Time"
            />
          </div>
        </section>
      </div>

      <section className="demo-footer glass-card">
        <h3>Smart Positioning Demo</h3>
        <p>Scroll down or resize to see the picker intelligent drop logic.</p>
        <div style={{ padding: '20px' }}>
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="Click to test smart position"
          />
        </div>
      </section>

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

export default App
