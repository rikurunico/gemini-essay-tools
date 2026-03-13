# Essay Corrector — Gemini AI

A simple tool to evaluate and correct essays using Google Gemini API. Supports single and batch modes with configurable temperature/top-p combinations.

## Stack

- **Backend** — Node.js + Express
- **Frontend** — React 18 + Vite + Tailwind CSS + shadcn/ui
- **AI** — Google Gemini API (`generateContent`)

## Getting Started

**1. Install dependencies**
```bash
npm install
```

**2. Set up environment**
```bash
cp .env.example .env
# then add your key:
# GEMINI_API_KEY=your_key_here
```

**3. Run in development**
```bash
npm run dev
```
- Frontend (Vite HMR): http://localhost:5173
- Backend (Express API): http://localhost:3000

**4. Build for production**
```bash
npm run build
npm start         # serves dist/ on port 3000
```

## Features

### Single Mode
Paste one essay, hit **Correct Essay**, and get inline corrections with error explanations rendered from the Gemini response.

### Batch Mode
Add multiple essays and process them all concurrently. Each essay is run against every selected **Temperature × Top-P combination** simultaneously.

- Toggle Low / Mid / High levels for both Temperature and Top-P
- Edit the exact values per level
- Combo count badge shows how many requests will fire per essay (e.g. 3×3 = 9)
- Results displayed in tabs per combination
- **Download CSV** — exports all results with columns: `Essay #, Combo, Temperature, Top-P, Essay, Result, Status, Processed At`

### Preprompt Settings
Click **Preprompt** in the header to customize the system instruction sent to Gemini. Use `{{essay}}` as the placeholder for the essay content. Settings are saved to `localStorage`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/models` | Returns available Gemini models that support `generateContent` |
| `POST` | `/api/correct` | Corrects an essay using Gemini |

### POST `/api/correct` body
```json
{
  "essay": "...",
  "model": "gemini-2.0-flash",
  "temperature": 0.3,
  "topP": 0.9,
  "preprompt": "You are... {{essay}}"
}
```

## Project Structure

```
├── server.js            # Express backend
├── src/
│   ├── App.jsx          # Root layout + shared state
│   ├── components/
│   │   ├── SingleMode.jsx
│   │   ├── BatchMode.jsx
│   │   ├── SettingsPanel.jsx
│   │   ├── PrepromptDialog.jsx
│   │   ├── ResultDisplay.jsx
│   │   └── ui/          # shadcn/ui base components
│   └── index.css        # Tailwind + CSS variables
├── vite.config.js
└── tailwind.config.js
```
