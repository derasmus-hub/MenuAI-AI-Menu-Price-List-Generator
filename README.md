# MenuAI — AI Menu & Price List Generator

## Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Edit with your API keys
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Open in browser
- Backend API: http://localhost:8000/docs
- Frontend: http://localhost:5173
