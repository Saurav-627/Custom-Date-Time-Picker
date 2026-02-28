import React, { useState } from 'react'
import DatePicker from './components/DatePicker/DatePicker'
import TimePicker from './components/TimePicker/TimePicker'
import './App.css'

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('12:00')

  return (
    <main className="app-container">
      <header className="hero">
        <h1 className="title">Premium Pickers</h1>
        <p className="subtitle">Custom Date & Time Selectors for All Devices</p>
      </header>

      <div className="showcase glass-card">
        <section className="picker-section">
          <h2>Date Picker</h2>
          <p>Calendar for desktop, wheel scroll for mobile.</p>
          <div className="picker-demo">
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Choose a date"
            />
            {selectedDate && (
              <div className="status-badge">
                Selected: {selectedDate.toDateString()}
              </div>
            )}
          </div>
        </section>

        <section className="picker-section">
          <h2>Time Picker</h2>
          <p>Grid for desktop, visual clock for mobile.</p>
          <div className="picker-demo">
            <TimePicker
              value={selectedTime}
              onChange={setSelectedTime}
              placeholder="Choose a time"
            />
            {selectedTime && (
              <div className="status-badge">
                Selected: {selectedTime}
              </div>
            )}
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

export default App
