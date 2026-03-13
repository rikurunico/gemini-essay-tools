# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev mode: starts Express (port 3000) + Vite dev server (port 5173) concurrently
npm run dev:server   # Express only
npm run dev:client   # Vite only
npm run build        # Build React app → dist/
npm start            # Production: node server.js (serves dist/)
```

## Environment Setup

Copy `.env.example` to `.env` and set `GEMINI_API_KEY`. The server will fail to call the Gemini API without it.

## Architecture

React + Vite frontend (`src/`) + Express backend (`server.js`) + Google Gemini API.

**Backend (`server.js`)** — ESM module, exposes two endpoints on port 3000 (or `PORT` env var):
- `GET /api/models` — proxies Gemini's model list, filters to models supporting `generateContent`
- `POST /api/correct` — accepts `{ essay, temperature, topP, model, preprompt }` and returns `{ result }` from Gemini
  - `preprompt` is optional; falls back to default if not provided. Use `{{essay}}` as placeholder.

In production, Express serves the built frontend from `dist/` with an SPA fallback.

**Frontend (`src/`)** — React 18 + Vite + Tailwind CSS + shadcn/ui components:
- `src/App.jsx` — main layout, shared state (model, temperature, topP, preprompt)
- `src/components/SingleMode.jsx` — single essay correction
- `src/components/BatchMode.jsx` — batch processing with CSV download
- `src/components/PrepromptDialog.jsx` — editable system preprompt (saved to localStorage)
- `src/components/SettingsPanel.jsx` — model selector, temperature/topP sliders, presets
- `src/components/ResultDisplay.jsx` — markdown renderer for Gemini output
- `src/components/ui/` — shadcn/ui base components (Button, Badge, Card, Dialog, etc.)

**Dev workflow:** Vite dev server (5173) proxies `/api/*` to Express (3000). Run `npm run dev` to start both.
