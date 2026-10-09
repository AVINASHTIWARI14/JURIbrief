<div align="center">

# 𓍝 JURIbrief 𓍝

### AI-Powered Legal Document Assistant

**Understand what you're signing before you sign it.**

Analyze legal documents, uncover risky clauses, compare versions, and generate drafts with AI assistance.

[Explore the Repository](https://github.com/AVINASHTIWARI14/JURIbrief) · [Report an Issue](https://github.com/AVINASHTIWARI14/JURIbrief/issues)

</div>

---

## ✨ Overview

JURIbrief helps make complex legal documents easier to understand. Upload a document or paste its text to receive an AI-generated summary, identify potential risks and deadlines, ask follow-up questions, compare document versions, or draft a new document.

> **Important:** JURIbrief is an informational tool, not a substitute for advice from a qualified legal professional. AI-generated findings can be incomplete or inaccurate; verify important decisions with a lawyer.

## 🚀 Features

| Feature | What it does |
| --- | --- |
| 📄 **Document Analysis** | Analyze PDF, DOCX, and TXT legal documents. |
| ⚠️ **Risk Detection** | Highlight potentially critical and moderate risks, obligations, and unfavorable clauses. |
| 📌 **Key Points & Deadlines** | Surface important terms, dates, notice periods, and deadlines found in the text. |
| ⚖️ **AI Legal Chat** | Ask Juri questions about the platform, legal concepts, and an analyzed document. |
| 🔍 **Document Comparison** | Compare two document versions and review changes or newly introduced risks. |
| ✍️ **Document Generation** | Draft legal documents from a plain-English description, with a selected jurisdiction. |
| 🌐 **Multi-language Support** | Translate supported analysis content into available languages. |
| 🔐 **Authentication** | Sign in with email/password or Google and recover access to an account. |
| 🛡️ **Admin Dashboard** | View registered users, manage access, and review contact messages. |

## 🖥️ Screenshots

### Home page
<p align="center">
  <img src="screenshots/Screenshot%202026-09-09%20141024.png" alt="JURIbrief home page" width="90%">
</p>

### Authentication
<p align="center">
  <img src="screenshots/Screenshot%202026-09-09%20141121.png" alt="JURIbrief authentication page" width="90%">
</p>

### Document analyzer
<p align="center">
  <img src="screenshots/Screenshot%202026-09-09%20141248.png" alt="Upload and analyze a legal document" width="90%">
</p>

### AI analysis and risk detection
<p align="center">
  <img src="screenshots/Screenshot%202026-09-09%20141403.png" alt="AI-generated legal document analysis" width="90%">
</p>
<p align="center">
  <img src="screenshots/Screenshot%202026-09-09%20141418.png" alt="Risk levels and deadline extraction" width="90%">
</p>

### Admin dashboard
<p align="center">
  <img src="screenshots/Screenshot%202026-09-09%20141453.png" alt="JURIbrief admin dashboard" width="90%">
</p>

## 🧰 Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| AI | Google Gemini API |
| Document processing | PDF.js, Mammoth |
| Deployment | Vercel, Render |
| Version control | Git, GitHub |

## ⚙️ Run Locally

### Prerequisites

- Node.js and npm
- A Supabase project
- A Google Gemini API key for AI-powered features
- PostgreSQL connection details for the backend

### 1. Clone the repository

```bash
git clone https://github.com/AVINASHTIWARI14/JURIbrief.git
cd JURIbrief
```

### 2. Configure environment variables

**Frontend — `client/.env`**

Create a `.env` file in the `client` directory:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

These values are available in your Supabase project settings. The frontend example file is `client/.env.example`.

**Backend — `Backend/.env`**

Create a private `.env` file in `Backend` and provide the configuration used by the backend, including:

```env
PORT=5001
DATABASE_URL=your-postgresql-connection-string
GEMINI_API_KEY=your-gemini-api-key
```

Use your own credentials and any additional settings required by your Supabase/PostgreSQL setup. Never commit real API keys, passwords, or private service-role keys.

### 3. Install and start the backend

```bash
cd Backend
npm install
npm start
```

By default, the API listens on port `5001`. The server checks the database connection during startup.

### 4. Install and start the frontend

Open a second terminal from the repository root:

```bash
cd client
npm install
npm run dev
```

Vite runs the frontend locally and proxies `/api` requests to `http://localhost:5001`.

### 5. Database setup

Review `Backend/schema.sql` and apply the required schema to your PostgreSQL/Supabase database using the appropriate SQL editor before using database-backed features.

## 📁 Project Structure

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
│   ├── server.js
│   └── package.json
├── client/
│   ├── public/
│   └── src/
├── screenshots/
└── README.md
```

## 🔒 Security & Privacy

- Keep `.env` files out of version control.
- Never expose Gemini API keys or database credentials in frontend code.
- Use the public Supabase anon/publishable key in the frontend; configure appropriate database security policies.
- Only upload documents you are authorized to share. Review your deployment and data-handling configuration before processing confidential documents.

## ⚖️ Disclaimer

JURIbrief is intended for general informational purposes only and does not provide legal advice or establish a lawyer-client relationship. AI outputs may be inaccurate, incomplete, or out of date. Consult a qualified legal professional for advice on a specific legal matter.

## 📄 License

No license file is currently included in this repository. All rights remain with the project owner unless a license is added.

---

<div align="center">

**JURIbrief — Legal documents, made easier to understand.**

</div>
