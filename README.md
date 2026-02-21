## Shamiri Supervisor Copilot

A mini-product to help Tier 2 Supervisors review Shamiri Fellow group sessions using structured AI analysis. Supervisors can see a dashboard of completed sessions, open a session to view an AI-generated Session Insight Card, and then validate or override the AI’s recommendations.

### Tech stack

- **Framework**: Next.js App Router (TypeScript)
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: Tailwind CSS
- **AI**: Groq Chat Completions (LLaMA 3.3) with JSON-only responses + Zod validation

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

### Session Detail & AI Insight Card

For each session:

- **Header**: Fellow, Group ID, date, current status, AI risk flag.
- **Session Insight Card** (AI-generated):
  - 3-sentence **summary** of the session.
  - **Content Coverage** score (1–3) with rationale.
  - **Facilitation Quality** score (1–3) with rationale.
  - **Protocol Safety** score (1–3) with rationale.
  - **Risk** block:
    - `SAFE` or `RISK`
    - If `RISK`, shows a short **quote** from the transcript and a brief explanation.
- **Transcript viewer**: Scrollable, full transcript for human review.

Supervisors can trigger AI analysis from the session page. While this assignment uses a simple action behind the scenes to `/api/sessions/[id]/analyze`, the backend:

- Sends the transcript plus the Shamiri rubric to Groq (LLaMA 3.3).
- Instructs the model via the **system prompt** to return **only valid JSON** in a fixed shape.
- Validates the response with **Zod** against a strict schema.
- Persists the structured analysis and updates the session status (`PROCESSED` or `RISK`).

### Human-in-the-loop Supervisor review

- Right-hand panel lets the Supervisor:
  - Mark the session as **Safe**, **Risk**, or **Needs discussion**.
  - Add an optional **note** explaining their judgment (e.g., “AI misread peer banter as risk”).
- On save:
  - A `SupervisorReview` record is stored.
  - The `Session` status is updated to the chosen final status.
  - The most recent decision is displayed back in the UI for future reference.

---

## Deployment (Vercel + Supabase)

1. **Create a Supabase project** and copy the Postgres connection strings (Settings → Database).
2. **Push your repo to GitHub**.
3. **Create a new Vercel project** from the repo.
4. In Vercel project settings, add environment variables:

   - `DATABASE_URL`
   - `DIRECT_URL` (if needed for migrations)
   - `GROQ_API_KEY`
   - `NEXT_PUBLIC_BASE_URL` = your production URL (e.g., `https://shamiri-supervisor.vercel.app`)
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` (for mock sign-in)
   - `SESSION_TIME_ZONE` (optional, e.g. `Africa/Nairobi` for date formatting; defaults to `Africa/Nairobi`)

5. Run migrations (one-off, locally or in build):

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

6. **Seed the production database** (run locally, once):

   ```bash
   cp env.production.example .env.production
   # Edit .env.production – paste DATABASE_URL and DIRECT_URL from Vercel
   npm run prisma:seed:prod
   ```

7. Trigger a deployment; the app should be available at your Vercel URL.

---

## AI usage notes (for submission)

- **AI-generated code**:
  - Portions of boilerplate (Next.js + Tailwind layout patterns).
  - Initial drafts of Prisma model definitions and Zod schemas.
  - Skeleton versions of API routes and UI components.
- **Hand-written / heavily edited**:
  - Final Prisma schema reflecting Shamiri entities (Supervisor, Fellow, Group, Session, AIAnalysis, SupervisorReview).
  - AI prompt engineering to encode the 3-metric rubric and risk rules.
  - Error handling, type-safety, and wiring between frontend, backend, and database.
  - UX details (copy aimed at non-technical Tier 2 Supervisors, African context-friendly).

**Verification steps**:

- Type-check and lint the code (`npm run lint`).
- Manual testing:
  - Load dashboard and confirm at least 10 sessions are visible.
  - Open a session; trigger AI analysis and confirm the insight card renders with scores and risk.
  - Mark sessions as Safe / Risk / Needs discussion and ensure the dashboard and detail views reflect the updated status.
