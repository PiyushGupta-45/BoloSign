# PDF Signature Application

A full-stack application for uploading PDFs, adding signatures, and generating signed PDFs with audit logging.

## Features

- Upload PDF files
- Draw or type signatures
- Drag and drop signatures on PDF
- Generate signed PDFs
- Audit trail with hash verification

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (optional - for audit logging)
- npm or yarn

## Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/pdf-signer
PORT=5000
```

4. (Optional) Start MongoDB if you want audit logging. The app will work without MongoDB, but audit logs won't be saved.

5. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Usage

1. Open the frontend application in your browser
2. Click "Upload" to select a PDF file
3. Click "Add Signature" to create a signature (draw or type)
4. Click on the PDF where you want to place the signature
5. Drag the signature to adjust its position
6. Click "Place" to lock the signature position
7. Click "Sign & Download" to generate and download the signed PDF

## Project Structure

```
project/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── pdfs/            # Uploaded PDFs
│   └── signed/          # Signed PDFs
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   └── App.jsx      # Main app component
    └── public/          # Static assets
```

## API Endpoints

- `POST /api/upload` - Upload a PDF file
- `POST /api/sign-pdf` - Sign a PDF with a signature

## Notes

- The application will create required directories (`pdfs`, `signed`) automatically
- MongoDB is optional - the app will continue to work without it, but audit logs won't be saved
- Signed PDFs are stored in the `backend/signed/` directory

