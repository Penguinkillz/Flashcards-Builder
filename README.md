# Flashcards

Standalone MVP: enter a topic and/or paste/upload notes (PDF/DOCX) → get AI-generated flashcards. Flip cards or step through with Previous/Next.

Part of a suite of AI micro-tools; same “one input → LLM → structured output → simple UI” pattern.

## Features

- **Topic only**: POST JSON with `topic` → flashcards generated from the topic.
- **Topic + pasted text**: Include `sources_text` in JSON or use the form.
- **Topic + PDF/DOCX**: Upload files via multipart (optional topic hint + paste). Uses the same extraction as other tools (PDF/DOCX, max 10MB).
- **UI**: Dark theme, flip card on click, Previous/Next to step through. No auth or persistence (MVP).

## Local setup

1. **Clone or copy** this repo to `C:\flashcards` (or your chosen path).

2. **Create a virtualenv and install dependencies:**
   ```bash
   cd C:\flashcards
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure env:** Copy `.env.example` to `.env` and set at least:
   ```bash
   PLATFORM_GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   Open http://localhost:8000

## GitHub & deploy

### Push to GitHub

1. **Create a new repo** on [GitHub](https://github.com/new): name e.g. `flashcards`, leave it empty (no README/license).
2. **Push this project:**
   ```bash
   cd C:\flashcards
   git remote add origin https://github.com/YOUR_USERNAME/flashcards.git
   git branch -M main
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username. Use SSH URL if you prefer: `git@github.com:YOUR_USERNAME/flashcards.git`.

### Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in (e.g. with GitHub).
2. **New Project** → **Deploy from GitHub repo** → select your `flashcards` repo.
3. Railway will detect the **Procfile** and use it as the start command. No build step needed.
4. **Variables** (in the service or project): add at least:
   - `PLATFORM_GROQ_API_KEY` = your Groq API key  
   Optionally: `PLATFORM_GROQ_API_KEY_2`, `PLATFORM_GROQ_API_KEY_3`, `PLATFORM_OPENAI_API_KEY`.
5. **Settings** → under **Networking** click **Generate Domain** to get a public URL (e.g. `https://your-app.up.railway.app`).
6. Open the URL; the app runs at the root with the same UI as locally.

## Env vars (all under `PLATFORM_` prefix)

| Variable | Required | Description |
|----------|----------|-------------|
| `PLATFORM_GROQ_API_KEY` | Yes* | Groq API key (Llama 3.3 70B). |
| `PLATFORM_GROQ_API_KEY_2` | No | Extra key for rotation. |
| `PLATFORM_GROQ_API_KEY_3` | No | Extra key for rotation. |
| `PLATFORM_OPENAI_API_KEY` | No | Fallback if no Groq key set. |

\*Required unless `PLATFORM_OPENAI_API_KEY` is set.

## API

- **POST /api/flashcards/generate**  
  JSON body: `{ "topic": "...", "sources_text": "..." }` (both optional but at least one of topic or sources_text).
- **POST /api/flashcards/generate-from-files**  
  Multipart: `topic_hint`, `sources_text`, `files` (PDF/DOCX). At least paste or files required.

Response: `{ "cards": [ { "front": "...", "back": "..." }, ... ] }`

## Future

We will later upgrade to a better tech stack, improve the frontend, and add a solid backend (auth, payments, etc.). This repo is MVP only.
