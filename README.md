# @sauravluitel/date-time-picker-custom

[![npm version](https://img.shields.io/npm/v/@sauravluitel/date-time-picker-custom.svg)](https://www.npmjs.com/package/@sauravluitel/date-time-picker-custom)
[![license](https://img.shields.io/npm/l/@sauravluitel/date-time-picker-custom.svg)](https://github.com/Saurav-627/Custom-Date-Time-Picker)

A professional, high-performance, and responsive React Date and Time picker library. Built with **Vite**, **Framer Motion**, and **Lucide React**, it offers dedicated, premium UIs for both Desktop and Mobile devices.

---

## ✨ Features

- **📱 Dedicated Mobile UI**: 
  - **Scroll-Wheel Select**: Smooth, iOS-style wheel selects for Years, Months, Days, and Time.
  - **Touch Optimized**: Large tap targets and haptic-friendly scrolling.
- **🖥️ Premium Desktop UI**: 
  - **Elegant Calendar**: Full-featured grid with quick navigation between months and years.
  - **Grid Time Select**: Fast and efficient grid selection for precision time setting.
- **🔌 Form Ready (NEW in v1.0.1)**:
  - **Synthetic Events**: Emits standard `{ target: { name, value } }` objects.
  - **Drop-in Support**: Seamlessly integrates with **React Hook Form**, **Formik**, and **Yup**.
  - **Standard Formats**: Always returns standard strings (`YYYY-MM-DD` and `HH:mm`).
- **🛡️ Submission Protection**: All internal buttons are typed as `type="button"` to prevent accidental parent form submissions.
- **🎨 Glassmorphism Design**: Modern, sleek aesthetics with dark/light mode support and smooth micro-animations.

---

## 🚀 Installation

```bash
npm install @sauravluitel/date-time-picker-custom
# or
yarn add @sauravluitel/date-time-picker-custom
```

### ⚠️ Important: CSS Import
To use the premium styles, import the CSS file in your main entry file (e.g., `main.js` or `App.js`):

```javascript
import '@sauravluitel/date-time-picker-custom/style.css';
```

---

## 🛠️ Usage

### Basic Example

```jsx
import React, { useState } from 'react';
import { DatePicker, TimePicker } from '@sauravluitel/date-time-picker-custom';

function App() {
  const [date, setDate] = useState('2024-03-02');
  const [time, setTime] = useState('14:30');

  return (
    <div className="form-group">
      <DatePicker 
        value={date} 
        onChange={(e) => setDate(e.target.value)} 
      />
      
      <TimePicker 
        value={time} 
        onChange={(e) => setTime(e.target.value)} 
        use12h={true} 
      />
    </div>
  );
}
```

---

## 📋 Form Integration

### React Hook Form

```jsx
import { useForm, Controller } from "react-hook-form";
import { DatePicker } from "@sauravluitel/date-time-picker-custom";

function MyForm() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Controller
        name="birthDate"
        control={control}
        render={({ field }) => (
          <DatePicker 
            {...field} 
            placeholder="Select your birthday"
          />
        )}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## ⚙️ Props Reference

### DatePicker
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | `""` | Date in `YYYY-MM-DD` format. |
| `onChange` | `function` | `-` | Returns standard synthetic event. |
| `placeholder` | `string` | `"YYYY/MM/DD"` | Placeholder for the input field. |
| `disabled` | `boolean` | `false` | Disables all interactions. |
| `name` | `string` | `-` | Name for form integration. |

### TimePicker
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | `""` | Time in `HH:mm` (24h) format. |
| `onChange` | `function` | `-` | Returns standard synthetic event. |
| `use12h` | `boolean` | `true` | Show AM/PM selector. |
| `showSeconds`| `boolean` | `false` | Show seconds selector. |
| `disabled` | `boolean` | `false` | Disables all interactions. |

---

## 💻 Tech Stack
- **React** 18+
- **Framer Motion** (Animations)
- **Lucide React** (Icons)
- **date-fns** (Date logic)

## 📄 License
MIT © [Saurav Luitel](https://github.com/Saurav-627)
