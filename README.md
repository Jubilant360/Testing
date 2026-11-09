# NutriTrack - Vanilla Calorie & Macro Tracker

A lightweight, responsive, and privacy-focused calorie and macronutrient tracking web application built entirely with **vanilla HTML, CSS, and JavaScript**. 

No frameworks, no Tailwind, no CSS variables (`--var`), no dependencies, and no backend. All data is persisted directly in your browser via `localStorage`.

---

## Features

- **Daily Calorie Tracking**: Real-time progress ring showing consumed vs. remaining calories and daily target.
- **Macronutrient Tracking**: Visual progress bars for Protein, Carbohydrates, and Fats.
- **Water Intake Counter**: Interactive visual water glasses tracking daily hydration (250 ml increments).
- **Categorized Meal Logs**: Log and organize food entries by **Breakfast**, **Lunch**, **Dinner**, and **Snacks** with subtotal calorie calculations.
- **1-Click Quick Add Presets**: Instant preset buttons for common foods (Eggs, Bananas, Chicken Breast, Rice, Greek Yogurt, Protein Shakes, etc.).
- **Interactive Date Navigation**: Browse past and future logs with previous/next buttons, calendar date picker, or jump to "Today".
- **7-Day Calorie Trend Chart**: Pure HTML5 `<canvas>` bar chart displaying weekly intake against your daily target benchmark.
- **Customizable Goals**: Set custom daily targets for calories, protein, carbs, fat, and water.
- **Persistent & Portable Data**:
  - Automatically saved to browser `localStorage`.
  - Export full JSON backups anytime.
  - Import previous JSON backups to restore history.
  - One-click data reset option.

---

## Tech Stack

- **HTML5**: Semantic document structure, SVG circular progress rings, and HTML5 Canvas.
- **CSS3**: Pure vanilla CSS styling, fully responsive across desktop, tablet, and mobile (no CSS variables, no Tailwind).
- **JavaScript (ES6+)**: Pure client-side logic and storage management with zero external libraries or build tools.

---

## Getting Started

1. Clone or download the repository:
   ```bash
   git clone https://github.com/Jubilant360/calorie-tracker.git
   ```
2. Open `index.html` in any modern web browser.
3. Start tracking your meals and nutrition!

---

## License

MIT License. Open source and free to use.
