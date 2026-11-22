# 🎓 Diploma Applied Science MCQ Practice & Examiner Audit Platform

A modern, high-retention examination and practice platform engineered for Diploma engineering students. Built with React 18, Vite, Tailwind CSS, and Plus Jakarta Sans typography.

Includes an **Examiner / Administrator Console** with automated **Student Identity & Real-Time Geographic Location Tracking (GPS & Network Geo-IP)**, 1,046 syllabus questions, zero-repetition randomization, Challenger distractors, and spaced repetition mistake drills.

---

## 🌟 Key Features

### 👤 Student Exam Portal
- **Zero-Repeating Randomization**: Generates fresh exam question sets with guaranteed zero question repetition within any test session.
- **Official 70 Marks Pattern**: 70 randomized questions carrying 1.0 mark each with live countdown timer and question palette.
- **140 Questions Endurance Drill**: 140 questions carrying 0.5 marks each (= 70 marks total).
- **Interactive Step-by-Step Practice**: Immediate answer verification with streak tracker.
- **Memory Retention Hacks**: Every missed question provides an instant mnemonic/rule tip explaining how to memorize and never forget the concept.
- **Mistake Notebook**: Automatically archives questions answered incorrectly for targeted re-testing.
- **Syllabus Reading Mode**: Direct reading view & active-recall flashcard view for all 1,046 questions across Units 1–6.

### 🛡️ Examiner & Admin Console
- **Student Candidate Verification**: Students verify their Name, Roll Number, and Polytechnic Institution before beginning an exam.
- **Automated Geolocation Tracking**:
  - Automatically captures the candidate's exact testing location using **High-Precision Browser GPS** and **Network Geo-IP fallback** (City, State/Region, Country, Coordinates, IP).
  - Flags whether the location was verified via GPS or Network IP.
  - Direct Google Maps link for verified coordinates.
- **Real-Time Gradebook & Metrics**:
  - Total tests taken, unique candidates, class average percentage, and city distribution.
- **One-Click CSV / Excel Export**:
  - Export all student grades, roll numbers, timestamps, test marks, and geographic origins to `.csv` spreadsheet with one click.
- **Individual Student Audit Modal**:
  - Inspect any student's complete scorecard, answers, accuracy, and print official report cards.
- **PIN Protected**: Secure access using administrator PIN code (Default: `admin123`).

---

## 📚 Syllabus Question Bank Coverage

| Unit | Subject | Topic | MCQs |
| :--- | :--- | :--- | :---: |
| **Unit 1** | Physics | Units, Measurements & Vectors | 298 |
| **Unit 2** | Physics | Electricity & Magnetism | 198 |
| **Unit 3** | Physics | Waves & Oscillations | 150 |
| **Unit 4** | Physics | Optics & Modern Physics | 200 |
| **Unit 5** | Physics | Thermometry & Heat Transfer | 100 |
| **Unit 6** | Chemistry | Electrochemistry, Redox Reactions & Metallurgy | 100 |
| **Total** | | **Comprehensive Board Question Bank** | **1,046** |

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/<your-username>/diploma-mcq-platform.git
cd diploma-mcq-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### 4. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in `dist/`.

---

## 🔐 Administrator Access
- Click the **Admin** button in the top navigation bar or **Admin & Locations** in the left sidebar.
- Enter the Administrator PIN: `admin123`
- From here, examiners can monitor candidates in real time and download the CSV gradebook.

---

## 🌐 Deployment Options

### Deploy on Vercel or Netlify
1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "Initial commit of Diploma MCQ Practice & Admin Platform"
   git remote add origin https://github.com/<your-username>/diploma-mcq-platform.git
   git push -u origin main
   ```
2. Import the repository in [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`

---

## 📄 License
MIT License. Open for educational and classroom use.
