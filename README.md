# @sauravluitel/date-time-picker-custom

[![npm version](https://img.shields.io/npm/v/@sauravluitel/date-time-picker-custom.svg)](https://www.npmjs.com/package/@sauravluitel/date-time-picker-custom)
[![license](https://img.shields.io/npm/l/@sauravluitel/date-time-picker-custom.svg)](https://github.com/Saurav-627/Custom-Date-Time-Picker)

A professional, high-performance, and responsive React Date and Time picker library. Built with **Vite**, **Framer Motion**, and **Lucide React**, it offers dedicated, premium UIs for both Desktop and Mobile devices.

### 🔗 Live Demo
[https://custom-date-time-picker.netlify.app/](https://custom-date-time-picker.netlify.app/)



---

## ✨ Features

- **📱 Dedicated Mobile UI**: 
  - **Scroll-Wheel Select**: Smooth, iOS-style wheel selects for Years, Months, Days, and Time.
  - **Touch Optimized**: Large tap targets and haptic-friendly scrolling.
  - **React Portal Support (NEW)**: Renders via Portals to stay above all parents, even those with `transform` or `filter`.
- **🖥️ Premium Desktop UI**: 
  - **Elegant Calendar**: Full-featured grid with quick navigation between months and years.
  - **Grid Time Select**: Fast and efficient grid selection for precision time setting.
- **🔌 Form Ready (NEW in v1.0.1)**:
  - **Synthetic Events**: Emits standard `{ target: { name, value } }` objects.
  - **Drop-in Support**: Seamlessly integrates with **React Hook Form**, **Formik**, and **Yup**.
  - **Standard Formats**: Always returns standard strings (`YYYY-MM-DD` and `HH:mm`).
- **🛡️ Submission Protection**: All internal buttons are typed as `type="button"` to prevent accidental parent form submissions.
- **🎨 Glassmorphism & Themes**: 
  - **Manual Theme Control**: Toggle between Dark/Light modes regardless of system settings.
  - **High Visibility**: High z-index (`999999`) ensures pickers always stay on top.
  - **Modern Aesthetics**: Sleek glassmorphism with smooth micro-animations.

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
| `value` | `string` | `""` | Date in `YYYY-MM-DD` format (by default) or matches `outputMode`. |
| `onChange` | `function` | `-` | Returns standard synthetic event. |
| `placeholder` | `string` | `"YYYY/MM/DD"` | Placeholder for the input field. |
| `name` | `string` | `-` | Name for form integration. |
| `disabled` | `boolean` | `false` | Disables all interactions. |
| `isDarkMode` | `boolean` | `undefined` | Forces Dark Mode (`true`) or Light Mode (`false`). Default follows system. |
| `calendarMode`| `"AD" \| "BS"`| `"AD"` | Sets the default active calendar mode (Gregorian or Bikram Sambat). |
| `displayMode` | `"AD" \| "BS"`| `-` | Forces the calendar UI display mode (AD or BS) and overrides the toggle. |
| `outputMode`  | `"AD" \| "BS" \| "selection"`| `"AD"` | Formats the returned value string in the `onChange` event (AD is Gregorian `YYYY-MM-DD`, BS is Bikram Sambat `YYYY-MM-DD`, selection matches active mode). |

### TimePicker
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | `""` | Time in `HH:mm` (24h) format. |
| `onChange` | `function` | `-` | Returns standard synthetic event. |
| `use12h` | `boolean` | `true` | Show AM/PM selector. |
| `showSeconds`| `boolean` | `false` | Show seconds selector. |
| `disabled` | `boolean` | `false` | Disables all interactions. |
| `isDarkMode` | `boolean` | `undefined` | Forces Dark Mode (`true`) or Light Mode (`false`). Default follows system. |

---

## 📅 Bikram Sambat (BS) Calendar Support
The picker includes full, high-performance native Bikram Sambat (BS) calendar support with offline conversion (BS 2000 to BS 2100).

### ⚙️ Calendar Control Configurations

You can customize the initial rendering, UI constraints, and output values using three main props:

1. **`calendarMode`**: Sets the default active calendar mode upon initialization.
   - **`calendarMode="BS"`**: launches in Bikram Sambat calendar mode by default, but the toggle button is still visible for the user to switch back and forth.
   - **`calendarMode="AD"`**: launches in Gregorian AD calendar mode by default (Default).

2. **`displayMode`**: Statically forces the display mode, overriding and hiding the user-facing toggle.
   - **`displayMode="BS"`**: Locks the UI to the Bikram Sambat (BS) calendar only. The AD/BS toggle switch is hidden.
   - **`displayMode="AD"`**: Locks the UI to the Gregorian (AD) calendar only. The AD/BS toggle switch is hidden.

3. **`outputMode`**: Controls the format of the selected date string returned in the `onChange` event callback (value stored in form state and sent to API).
   - **`outputMode="AD"`**: Returns dates as a standard Gregorian `YYYY-MM-DD` string (e.g. `"2026-06-15"`). Matches the default HTML5 date input output, making it fully compatible with standard databases and REST APIs (Default).
   - **`outputMode="BS"`**: Returns dates as a Bikram Sambat `YYYY-MM-DD` string (e.g. `"2083-03-01"`). Useful if your backend database is configured to handle raw BS date strings directly.
   - **`outputMode="selection"`**: Dynamically matches the format to the currently selected calendar mode. If the calendar is in BS mode, it returns the BS date string (e.g. `"2080-05-24"`). If the calendar is in AD mode, it returns the AD date string (e.g. `"2023-09-10"`). Toggling the calendar dynamically updates and emits the formatted string to parent state.

### 💡 Examples

#### Hybrid Mode (BS UI, AD Output for Backend Database)
Displays the calendar in Bikram Sambat format for Nepalese users, but returns standard Gregorian format strings to keep databases compatible.
```jsx
<DatePicker 
  calendarMode="BS" 
  outputMode="AD" 
  onChange={(e) => console.log(e.target.value)} // Emits Gregorian date e.g. "2023-09-10"
/>
```

#### Pure BS Mode (Locked BS UI, BS Output)
Forces the calendar to only show Bikram Sambat (removing the mode toggle) and outputs the BS date representation.
```jsx
<DatePicker 
  displayMode="BS" 
  outputMode="BS" 
  onChange={(e) => console.log(e.target.value)} // Emits Bikram Sambat date e.g. "2080-05-24"
/>
```

#### Selection Mode (Dynamic Output Based on Calendar Selection)
Dynamically switches formatting output to align with whichever calendar system is currently active in the DatePicker.
```jsx
<DatePicker 
  outputMode="selection" 
  onChange={(e) => console.log(e.target.value)} // Emits BS if toggled to BS, AD if toggled to AD
/>
```

### ✨ Premium UI Visual Helpers
- **AD/BS Toggle Switch**: An elegant, native-feeling pill toggle is displayed at the top-left of the calendar dropdown popup.
- **Dual-Mode Subtitle Helper**: While viewing the calendar in one system, a secondary subtitle dynamically displays the equivalent month/year span in the other system in small, muted text (e.g., viewing `Falgun 2080` displays `(Feb/Mar 2024 AD)` beneath the header navigation).
- **iOS-style Mobile Scroll Parity**: Mobile scroll wheels automatically adjust columns (years `2000-2100` and month lengths) when switching modes, displaying full month names (like `Baisakh` or `September`) and secondary translated date previews.

---

## 💻 Tech Stack
- **React** 18+
- **Framer Motion** (Animations)
- **Lucide React** (Icons)
- **date-fns** (Date logic)

---

## 🚀 Roadmap
- [x] **BS (Bikram Sambat Support)**: Fully implemented (v1.0.5)! 🇳🇵

## 📄 License
MIT © [Saurav Luitel](https://github.com/Saurav-627)

