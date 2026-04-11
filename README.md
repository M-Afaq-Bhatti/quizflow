# QuizFlow - Online Exam Platform (MERN Stack)

## Project Structure
```
quizflow/
├── backend/       ← Node.js + Express + MongoDB API
│   ├── models/    ← MongoDB schemas
│   ├── routes/    ← API endpoints
│   ├── middleware/← JWT authentication
│   ├── .env       ← Environment variables
│   └── server.js  ← Main entry point
└── frontend/      ← React.js application
    └── src/
        ├── pages/    ← All page components
        ├── components/
        └── context/  ← Auth state management
```

## Quick Start
See the PDF User Manual for complete step-by-step instructions.

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Default Ports (2)
- Backend API: http://localhost:5000
- Frontend:    http://localhost:3000
