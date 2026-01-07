# Release Notes - Word Whiz Kids (v2.0)
**Date:** January 6, 2026

## 🚀 New Features
- **Wally Avatar:** A new animated Owl avatar that visually responds when Wally speaks or thinks.
- **New Favicon:** The browser tab now features a cute Owl icon to match Wally.
- **Level Progression:** Each learning session is now capped at **10 questions**.
- **Game Room Reward:** After completing 10 questions, students are automatically rewarded with **+30 Bonus Points** and redirected to the Game Room.
- **Smart Question Engine:** The app now remembers which words have been used in the current session to **prevent duplicate questions**.
- **Teacher Reports:** A new dashboard for teachers to track student progress and identify areas for improvement.

## 🎓 Special Education Features
- **Targeted Interventions:** The Curriculum Assistant now generates specific intervention activities with **IEP Accommodations** and **Maryland Standards (MCCRS)**.
- **Expert AI Chat:** The Teacher Chat is now powered by a "Special Education Expert" persona to help with specific student needs.

## 🐛 Bug Fixes & Stability
- **Fixed "Blank Screen" on Next Question:** Implemented a robust "Hard Refresh" system to ensure the next question always loads.
- **Fixed Digraph Logic:** Wally now correctly identifies and asks for beginning vs. ending sounds (e.g., for "fish" vs "ship").
- **Fixed "No Show" Text:** Added fail-safes to ensure challenge words are always visible, even if there is a data mismatch.
- **Improved Audio Timing:** The question text now appears *immediately*, without waiting for Wally to finish generating his speech.

## 🛠 Technical Updates
- **Build Verification:** The project has been successfully built locally with no errors.
- **Performance:** Added timeouts to AI requests to prevent hanging.

## 📦 Deployment
This version is ready for deployment.
1. Commit all changes.
2. Push to the main branch.
3. Netlify will automatically build and deploy using the `npm run build` command.
