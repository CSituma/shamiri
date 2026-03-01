## Shamiri Supervisor Review Tool

A small internal-style tool to help supervisors review Shamiri Fellow group sessions. Supervisors see a list of completed sessions, open a session to view a structured Session Insight card, and record a final supervision decision.

This is a **mock supervision environment**. All transcripts are synthetic and do not contain real participant data. The goal is to demonstrate an MVP, with product thinking, backend modelling, and human-in-the-loop oversight rather than deploy a production clinical tool.

### Tech stack

- **Framework**: Next.js App Router (TypeScript)
- **LLM**: Groq API (using Llama 3-70B)
- **Database**: PostgreSQL via Prisma ORM ( Supabase)
- **Styling**: Tailwind CSS

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
# Optional: DIRECT_URL for migrations if using PgBouncer
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
GROQ_API_KEY="gsk-..."
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@shamiri.local"
ADMIN_PASSWORD="admin1234"
```

- **DATABASE_URL**: Any Postgres instance (local or hosted like Neon, Supabase, Railway).
- **DIRECT_URL**: Direct connection string used by Prisma migrations when you're behind a connection pooler.
- **GROQ_API_KEY**: Groq key with access to the chosen chat model (e.g. `llama-3.3-70b-versatile`).
- **NEXT_PUBLIC_BASE_URL**: Used by server components to call the local API routes.
- **ADMIN_EMAIL** / **ADMIN_PASSWORD**: Simple mock login credentials for the locked admin sign-in screen.

### 2a. Mock login for reviewers

For local and dev runs, you can sign in with:

- Email: `admin@shamiri.local`
- Password: `admin1234`

These credentials are only for this sandbox; there is no real user data or integration with Shamiri’s production systems.

### 3. Run migrations and generate Prisma client

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Seed mock data

```bash
npm run prisma:seed
```

This will create:

- One mock **Tier 2 Supervisor**
- Several **Fellows** and **Groups**
- At least **10 completed sessions** with synthetic transcripts approximating 40–60 minute Growth Mindset sessions, including:
  - Strong, partial, and missed Growth Mindset coverage
  - Good vs. weak facilitation examples
  - Safe vs. protocol-violating advice
  - A few transcripts with explicit self-harm / crisis language for risk detection

### 5. Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000` to access the Supervisor dashboard.

---

## Features

### Dashboard

- Lists **completed sessions** overseen by the mock supervisor.
- Shows **Fellow name**, **Group ID**, **date/time**, **status**, and **risk badge** (`Safe` / `Risk`).
- Clicking a row opens the **Session Detail** view.

### Session Detail & Insight card

For each session:

- **Header**: Fellow, Group ID, date, current status, and risk flag.
- **Session Insight card**:
  - 3-sentence **summary** of the session.
  - **Content Coverage** score (1–3) with rationale.
  - **Facilitation Quality** score (1–3) with rationale.
  - **Protocol Safety** score (1–3) with rationale.
  - **Risk** block:
    - `SAFE` or `RISK`
    - If `RISK`, shows a short **quote** from the transcript and a brief explanation.
- **Transcript viewer**: Scrollable, full transcript for human review.

Supervisors can trigger an automated analysis from the session page. The backend validates the structured result and updates the session status before the supervisor records a final decision.

### Human-in-the-loop Supervisor review

- Right-hand panel lets the Supervisor:
  - Mark the session as **Safe**, **Risk**, or **Needs discussion**.
  - Add an optional **note** explaining their judgment (e.g., “AI misread peer banter as risk”).
- On save:
  - A `SupervisorReview` record is stored.
  - The `Session` status is updated to the chosen final status.
  - The most recent decision is displayed back in the UI for future reference.

---

## Project structure

- `src/app` – Next.js routes (dashboard, session detail, sign-in).
- `src/app/sessions/[id]` – Session detail page, insight card, review form, and analyze button.
- `src/lib` – Shared helpers (including analysis prompt and types).
- `prisma` – Prisma schema and seed scripts.

---

## Write-up

**What problem the project solves**  
Supervisors cannot listen to every group therapy session, yet they need to ensure quality, protocol adherence, and safety. This tool gives them a single place to see completed sessions, read a structured summary and scores, and record a final decision. The human always confirms or overrides the automated analysis.

**One technical decision**  
The analysis pipeline is built as a strict contract: the backend sends a detailed rubric to the LLM, requires JSON-only output, validates it with Zod, and stores a normalised structure (summary, three scored dimensions, risk flag and quote). That keeps the UI simple, the database consistent, and makes it straightforward to swap or tune the model without touching the rest of the stack.

**One thing I would do differently**  
I would invest more in feedback loops: tracking how often supervisors override the model (e.g. Risk → Safe with a note), where the model systematically over- or under-flags, and feeding that back into prompt tuning and product design so the tool improves over time.

---

## AI usage

- **AI-generated:** Boilerplate patterns (Next.js + Tailwind), early drafts of Prisma models and Zod schemas, skeleton API routes and UI components.
- **Hand-written / heavily edited:** Final Prisma schema and entity relationships, analysis prompt and rubric encoding, error handling and type-safety, wiring between frontend, API, and database, UX copy and flow.
- **Verification:** `npm run lint` for type-check and lint; manual testing of dashboard, session detail, analysis trigger, and supervisor override flow.
