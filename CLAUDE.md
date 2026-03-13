# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Start production server (node server.js)
npm run dev      # Start dev server with auto-reload (nodemon)
```

No build, lint, or test commands are configured.

## Environment Setup

Copy `.env.example` to `.env` and set `GEMINI_API_KEY`. The server will fail to call the Gemini API without it.

## Architecture

Single-file frontend (`public/index.html`) + Express backend (`server.js`) + Google Gemini API.

**Backend (`server.js`)** exposes two endpoints on port 3000 (or `PORT` env var):
- `GET /api/models` — proxies Gemini's model list, filters to models supporting `generateContent`
- `POST /api/correct` — accepts `{ essay, temperature, topP, model }` and returns `{ result }` from Gemini

Both endpoints require `GEMINI_API_KEY` in the environment. The backend uses `node-fetch` v2 (CommonJS) to call `generativelanguage.googleapis.com/v1beta`.

**Frontend (`public/index.html`)** is a self-contained SPA (vanilla JS, no bundler). It:
- Fetches available models on load and populates a dropdown
- Sends essay text to `/api/correct` and renders the markdown-like response with a custom inline renderer
- Has three presets (Precise / Balanced / Creative) that set temperature + topP sliders together

All static files are served from `public/` via `express.static`.
