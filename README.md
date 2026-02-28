# Premium Date & Time Picker Custom

A high-performance, responsive React Date and Time picker project built with **Vite**, **Framer Motion**, and **Lucide React**.

## ✨ Features

- **📱 Dedicated Mobile UI**:
  - **Date Picker**: Smooth wheel-like scroll select for Years, Months, and Days.
  - **Time Picker**: Interactive Visual Clock Face—ideal for illiterate users or quick selection.
- **🖥️ Premium Desktop UI**:
  - **Date Picker**: Full-featured, elegant calendar grid.
  - **Time Picker**: Efficient grid-based select for Hours and Minutes.
- **⌨️ Hybrid Input**: Support for both manual typing (with validation) and mouse/touch selection.
- **🎨 Aesthetics**: 
  - Glassmorphism design system.
  - Smooth micro-animations with Framer Motion.
  - Modern typography using the *Outfit* Google font.
  - Premium dark theme with vibrant blue accents.

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

## 📦 Project Structure

- `src/components/DatePicker`: Contains the DatePicker logic and responsive views.
- `src/components/TimePicker`: Contains the TimePicker logic and the Visual Clock Face.
- `src/components/Shared`: Reusable components like the `SharedInput`.
- `src/hooks`: Custom hooks like `useMediaQuery` for layout switching.
- `src/index.css`: Core design system and theme variables.

## 🛠️ Usage

```jsx
import { DatePicker, TimePicker } from './components';

function MyComponent() {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('12:00');

  return (
    <>
      <DatePicker value={date} onChange={setDate} />
      <TimePicker value={time} onChange={setTime} />
    </>
  );
}
```
