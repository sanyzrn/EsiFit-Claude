# EsiFit — Fitness & Bodybuilding Platform

EsiFit is a comprehensive, modern web application built for fitness enthusiasts, coaches, and beginners alike. It provides a complete suite of tools to manage training programs, calculate body metrics, track progress, and communicate with coaches.

## Features

- **14 Advanced Fitness Calculators:**
  - BMI (Body Mass Index)
  - Body Fat Percentage
  - BMR (Basal Metabolic Rate)
  - TDEE (Total Daily Energy Expenditure)
  - Macros Calculator
  - One-Rep Max (1RM) Estimator
  - FFMI (Fat-Free Mass Index)
  - Waist-to-Hip Ratio (WHR)
  - Water Intake Calculator
  - Goal Date Calculator
  - Calories Burned
  - Volume Load Calculator
  - Rep Max Table
  - Body Type Quiz
- **Workout Programs:** Access various training programs categorized by goal (Muscle Gain, Fat Loss, General Fitness, Strength) and level.
- **Diet & Nutrition Plans:** Follow curated diet plans with detailed meal breakdowns and macro tracking.
- **Progress Tracking:** Log body metrics (weight, body fat, measurements) and visualize progress over time with interactive charts.
- **Coach Chat & Support Tickets:** Premium users can interact with professional coaches directly, while standard users have access to a support ticketing system.
- **Bilingual Support (i18n):** Fully supports English and Persian (Farsi) languages, including Right-to-Left (RTL) layout.
- **Responsive Design:** A beautiful, dark-themed UI built with Tailwind CSS, ensuring a great experience on desktop and mobile devices.

## Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Language/i18n:** Custom lightweight context-based i18n
- **State Management:** Custom lightweight observable store

## Getting Started

### Prerequisites

Ensure you have Node.js and npm installed on your system.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/esifit.git
   cd esifit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL provided by Vite (typically `http://localhost:3000` or `http://localhost:5173`).

### Building for Production

To create a production-ready build, run:
```bash
npm run build
```
This will generate optimized files in the `dist` directory.

## License

This project is licensed under the MIT License.

## Disclaimer

This is a demo platform created for educational purposes. The health and fitness calculations provided are estimates based on standard formulas and should not replace professional medical advice.
