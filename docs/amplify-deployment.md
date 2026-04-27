# AWS Amplify Deployment

This app is a full-stack Next.js app. In Amplify, configure production services
instead of using local `.env`, local SQLite, or the local `uploads/` directory.

## Required Environment Variables

Set these in Amplify app settings before deploy:

- `DATABASE_URL`: PostgreSQL connection string, for example an RDS or Neon URL.
- `OPENAI_API_KEY`: OpenAI API key for translation, TTS, and transcription.
- `S3_UPLOAD_BUCKET`: S3 bucket name for question audio and response audio.
- `S3_UPLOAD_REGION`: AWS region for that bucket, for example `ap-south-1`.

Optional:

- `PORTAL_PASSWORD`: Enables portal password protection.

Do not commit `.env` with real secrets.

## Database

Prisma is configured for PostgreSQL. Amplify build runs:

```bash
npx prisma migrate deploy
npm run build
```

Make sure the database is reachable from Amplify and that the connection string
includes credentials with migration/table permissions.

## S3 Uploads

Audio files are stored under:

- `questions/<uuid>.mp3`
- `responses/<uuid>.webm`

The Amplify runtime role/credentials must be allowed:

- `s3:PutObject`
- `s3:GetObject`

for `arn:aws:s3:::<S3_UPLOAD_BUCKET>/*`.

The app serves audio through `/api/uploads/...`, so the bucket can stay private.
