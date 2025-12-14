# Quick Setup Guide

## Prerequisites Check
- ✅ Node.js installed
- ✅ npm installed
- ⚠️ MongoDB (optional - for audit logging)

## Step 1: Backend Setup

1. Navigate to backend folder:
```powershell
cd backend
```

2. Create `.env` file (copy from `.env.example` if it exists, or create new):
```env
MONGO_URI=mongodb://localhost:27017/pdf-signer
PORT=5000
```

3. Install dependencies (if not already done):
```powershell
npm install
```

4. Start backend server:
```powershell
npm start
```

Backend will run on `http://localhost:5000`

## Step 2: Frontend Setup

1. Open a NEW terminal window

2. Navigate to frontend folder:
```powershell
cd frontend
```

3. Install dependencies (if not already done):
```powershell
npm install
```

4. Start frontend server:
```powershell
npm run dev
```

Frontend will run on `http://localhost:5173` (or another port)

## Quick Start Scripts

You can also use the PowerShell scripts:
- `start-backend.ps1` - Starts the backend server
- `start-frontend.ps1` - Starts the frontend server

Run them from the project root directory.

## Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Make sure MongoDB is running (if using audit logging)
- Check that `.env` file exists in backend folder

### Frontend won't start
- Check if the port is already in use
- Make sure all dependencies are installed (`npm install`)

### PDF upload fails
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify CORS is enabled in backend

### Signature not appearing
- Check browser console for errors
- Make sure PDF worker file exists in `frontend/public/pdf.worker.min.mjs`
- Try refreshing the page

