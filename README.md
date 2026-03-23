# Flashcards

Standalone MVP: enter a topic and/or paste/upload notes (PDF/DOCX) → get AI-generated flashcards. Flip cards or step through with Previous/Next.

Part of a suite of AI micro-tools; same “one input → LLM → structured output → simple UI” pattern.

## Features

- **Topic only**: POST JSON with `topic` → flashcards generated from the topic.
- **Topic + pasted text**: Include `sources_text` in JSON or use the form.
- **Topic + PDF/DOCX**: Upload files via multipart (optional topic hint + paste). Uses the same extraction as other tools (PDF/DOCX, max 10MB).
- **UI**: Dark theme, flip card on click, Previous/Next to step through. No auth or persistence (MVP).

## Local setup

### Backend (FastAPI)

1. **Install the private `orchestrator` package, then app deps:**
   ```bash
   cd C:\flashcards
   python -m venv .venv
   .venv\Scripts\activate       # Windows PowerShell
   ```
   **Local monorepo** (sibling folder `C:\orchestrator`):
   ```bash
   pip install -r requirements-dev.txt
   ```
   **Or** install orchestrator first, then base requirements:
   ```bash
   pip install -e ..\orchestrator
   pip install -r requirements.txt
   ```

2. **Configure env:** Copy `.env.example` to `.env` and set at least:
   ```bash
   PLATFORM_GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Run the backend:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend (Next.js dev server)

Open a second terminal:

```bash
cd C:\flashcards\frontend
copy .env.example .env.local   # sets NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev                    # http://localhost:3000
```

The dev server proxies API calls to `localhost:8000` via `NEXT_PUBLIC_API_URL`.

### After any frontend change — rebuild the static export for production

```bash
cd C:\flashcards\frontend
npm run build                  # generates frontend/out/
cd ..
git add -A
git commit -m "update frontend"
git push
```

Railway serves `frontend/out/` via FastAPI's StaticFiles — no Node.js runtime needed in production.

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

The backend depends on the private **`orchestrator`** Python package (not in this repo by default).

1. **Build:** In Railway → your service → **Settings** → set **Custom Build Command**, e.g.:
   ```bash
   pip install git+https://github.com/YOUR_ORG/orchestrator.git@main && pip install -r requirements.txt
   ```
   Use a deploy token or SSH as needed for a **private** orchestrator repo.  
   (`requirements.txt` does not include `-e ../orchestrator` so the clone-only repo builds cleanly.)

2. Go to [railway.app](https://railway.app) and sign in (e.g. with GitHub).
3. **New Project** → **Deploy from GitHub repo** → select your `flashcards` repo.
4. Railway will use **Procfile** / `railway.json` for start. The repo’s default `railway.json` only runs `pip install -r requirements.txt`; **you must** either set the **Custom Build Command** as above or change `build.buildCommand` in `railway.json` to prepend `pip install git+...orchestrator...` so `import orchestrator` works at runtime.
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
