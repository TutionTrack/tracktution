# Tuition Session Tracker

A full-stack application to track and manage tuition sessions. 
Built with a React (Vite) frontend and Node.js/Express backend with SQLite.

## Features
- Secure Authentication (JWT, bcrypt) with Email OTP verification.
- Teacher Dashboard for managing students and sessions.
- Recurring sessions and automated email reminders.
- Detailed session logging and calculation of teaching hours.
- Downloadable `.txt` reports with filters.
- Modern Navy Blue and White responsive UI.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, React Router DOM, custom CSS variables.
- **Backend**: Node.js, Express, Sequelize (SQLite), jsonwebtoken, nodemailer.

## Folder Structure
- `/client` - React frontend application.
- `/server` - Node.js Express API and database models.

## Local Installation
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Track-Tutions-Sessions
   ```

2. **Setup Backend**:
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your SMTP credentials for emails.
   npm run build
   node dist/index.js
   ```

3. **Setup Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Deployment to GitHub

To push the project to GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Tuition Session Tracker"
git branch -M main
git remote add origin <Your-GitHub-Repository-URL>
git push -u origin main
```

**Note**: Do NOT commit your `.env` file to GitHub!

## Hosting Options
- **Backend (Express + SQLite)**: Host on Render, Heroku, or an AWS EC2 instance. Ensure persistent volume storage is attached so the SQLite database is not lost, or switch to PostgreSQL.
- **Frontend (Vite)**: Can be hosted on Vercel, Netlify, or GitHub Pages. Update the API URLs in the frontend to point to your live backend.
