# Aptitude-Lab

A modern web application for creating, taking, and analyzing quizzes, built with **React (TypeScript)** and **Supabase**. The system provides detailed quiz results, topic-wise analysis, and an admin dashboard to view all user quiz histories. Built strictly using open source tools.

---

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/525bbf82-e4c9-4d0c-b0f9-9aca04b0ce44" />

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Project Structure](#project-structure)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Admin Features](#admin-features)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Features

- **User Features**
  - Take quizzes with multiple questions.
  - View detailed quiz results with:
    - Correct vs incorrect answers.
    - Section-wise and topic-wise performance.
    - Time taken and score percentage.
  - View all past attempts in a sortable history table.

- **Admin Features**
  - Drill-down into any user’s quiz history via query parameters.
  - View detailed analytics for each user.

- **Analytics**
  - Sectional performance analysis.
  - Topic-wise scoring breakdown.
  - Color-coded scoring for easy visualization.

- **User Experience**
  - Responsive design for desktops and tablets.
  - Loading states with animations.
  - Sortable tables and dynamic back navigation.

---

## Tech Stack

- **Frontend:** React, TypeScript, TailwindCSS  
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)  
- **UI Components:** Shadcn/UI, Lucide-React  
- **State Management & Hooks:** React Hooks, Custom Hooks (useToast)  
- **Routing:** React Router v6

---

## Project Structure

```
src/
  ├─ components/         # Reusable UI components
  ├─ hooks/              # Custom hooks (e.g., useToast)
  ├─ integrations/       # Supabase client setup
  ├─ pages/              # Application pages
  │   ├─ QuizPage.tsx
  │   ├─ QuizResultsPage.tsx
  │   ├─ UserReportsPage.tsx
  └─ App.tsx
  └─ main.tsx
public/
  └─ index.html
```

---

## Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd <project-folder>
```

2. Install dependencies:
```bash
npm install
```

3. Configure Supabase:
   - Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=<your-supabase-url>
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

4. Run the development server:
```bash
npm run dev
```

---

## Usage

- Open your browser at `http://localhost:5173`.
- Users can start quizzes, select answers, and view their results.
- Admins can access any user's quiz history by using query parameters, e.g., `/user/reports?userId=<targetUserId>`.

---

## Admin Features

- View all users' quiz histories.
- Drill-down into individual user attempts.
- See detailed sectional and topic-based performance.
- Accessible via query parameter `userId` for admin views.


