<p align="center">

# 𓍝 JURIbrief 𓍝

### AI-Powered Legal Document Assistant

Understand legal documents. Identify risks. Make informed decisions.

</p>

JURIbrief is an AI-powered legal document assistant designed to help users review legal documents, identify potentially risky clauses, compare versions, ask document-related questions, and generate document drafts from one workspace.

> **Disclaimer:** JURIbrief provides AI-generated information for general informational purposes only. It is not a substitute for advice from a qualified legal professional. Always verify important findings with a lawyer.

## Features

- **AI Document Analysis** — Analyze supported PDF, DOCX, and TXT documents.
- **Risk Detection** — Highlight potentially risky clauses, obligations, deadlines, and important terms.
- **Document Comparison** — Compare document versions and review differences.
- **AI Legal Chat** — Ask questions about a document and receive context-aware responses.
- **Document Generation** — Create tailored legal document drafts with AI assistance.
- **Multi-language Support** — Work with legal documents in different languages.
- **Authentication** — Sign in using email/password or Google, with password recovery.
- **Admin Dashboard** — Review waitlist requests, manage registered users and access, and read contact messages.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express |
| Database & Authentication | Supabase, PostgreSQL |
| AI | Google Gemini API |
| Document processing | PDF.js, Mammoth |
| Deployment | Vercel, Render |
| Version control | Git, GitHub |

## Screenshots

### Home
![JURIbrief Home](./screenshots/Screenshot%202026-09-09%20141024.png)

### Authentication
![Authentication](./screenshots/Screenshot%202026-09-09%20141121.png)

### Document Analyzer
![Document Analyzer](./screenshots/Screenshot%202026-09-09%20141248.png)

### AI Analysis
![AI Analysis](./screenshots/Screenshot%202026-09-09%20141403.png)

### Risk Detection
![Risk Detection](./screenshots/Screenshot%202026-09-09%20141418.png)

### Admin Dashboard
![Admin Dashboard](./screenshots/Screenshot%202026-09-09%20141453.png)

## Run Locally

### Prerequisites

- Node.js and npm
- A Supabase project
- A Google Gemini API key for AI-powered features

### 1. Clone the repository

```bash
git clone https://github.com/AVINASHTIWARI14/JURIbrief.git
cd JURIbrief
```

### 2. Configure the frontend

Create a `.env` file inside `client/` and add your Supabase project details:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Use the values from **Supabase Dashboard → Project Settings → API**. Never commit real credentials.

### 3. Configure the backend

Create `Backend/.env` and set the environment variables required by the backend, including your Gemini API key and database/Supabase connection settings. Use your own credentials and keep this file private.

### 4. Start the backend

Open a terminal:

```bash
cd Backend
npm install
node server.js
```

The backend runs on port `5001` by default.

### 5. Start the frontend

Open a second terminal from the repository root:

```bash
cd client
npm install
npm run dev
```

Vite starts the frontend and proxies `/api` requests to `http://localhost:5001`.

## Project Structure

```text
JURIbrief/
├── Backend/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── schema.sql
│   └── server.js
├── client/
│   ├── public/
│   └── src/
├── screenshots/
└── README.md
```

## Security Notes

- Keep API keys, database credentials, and private service-role keys out of source control.
- Only use the public Supabase anon/publishable key in the browser, alongside correctly configured Supabase security policies.
- Do not upload confidential legal documents unless you are authorized to do so.

## License

No license file is currently specified in this repository. All rights remain with the respective owner unless a license is added.

---

<p align="center">Built to make legal documents easier to understand.</p>
