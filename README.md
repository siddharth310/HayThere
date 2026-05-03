# HayThere Field Force

HayThere is a full-stack Next.js app for voice-first field surveys, portal
management, multilingual question audio, field training videos, and auditable
responses.

## Getting Started

1. Copy environment defaults:

```bash
cp .env.example .env
```

2. Set a PostgreSQL `DATABASE_URL`, `OPENAI_API_KEY`, and optional
   `PORTAL_PASSWORD`.

3. Install dependencies and prepare the database:

```bash
npm ci
npm run db:migrate
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Scripts

- `npm run dev` - local development server.
- `npm run build` - Prisma generate + production build.
- `npm run start` - production Next.js server.
- `npm run start:ec2` - apply migrations, then start on `0.0.0.0`.
- `npm run db:migrate` - local Prisma development migration.
- `npm run db:deploy` - production migration deployment.
- `npm run lint` - ESLint.

## Required Production Services

- PostgreSQL database (RDS, Neon, Supabase, etc.).
- S3 bucket for audio uploads.
- OpenAI API key.

## AWS Deployment

This repo supports two AWS paths:

- Amplify Hosting: see `docs/amplify-deployment.md`.
- EC2 as a single full-stack app: see `docs/ec2-deployment.md`.

For EC2, you can run directly with Node/systemd or with the included
`Dockerfile`.

## Health Check

Use this route for ALB/Nginx/monitoring checks:

```bash
curl http://localhost:3000/api/health
```

## Environment Variables

See `.env.example`. Do not commit real `.env` files.

Key variables:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `S3_UPLOAD_BUCKET`
- `S3_UPLOAD_REGION`
- `PORTAL_PASSWORD` (optional but recommended)

## Notes

- SQLite is no longer used; production and local dev should use PostgreSQL.
- When `S3_UPLOAD_BUCKET` is set, uploads are stored in S3.
- If `S3_UPLOAD_BUCKET` is not set, uploads fall back to local `uploads/`
  storage, which is only suitable for local/dev or a single persistent EC2 disk.
