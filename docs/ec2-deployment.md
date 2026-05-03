# AWS EC2 Deployment

This repo can run on EC2 as one full-stack Next.js service. It does not need a
separate frontend/backend split.

## Recommended AWS Setup

- EC2 instance: Ubuntu 22.04/24.04 or Amazon Linux 2023.
- Node.js: 22 LTS or 20.9+.
- Database: RDS PostgreSQL or another reachable PostgreSQL service.
- Uploads: S3 bucket for question audio and response audio.
- Process manager: `systemd` or Docker.
- Reverse proxy: Nginx, ALB, or both.

## Required Environment Variables

Create `/opt/haythere/.env` on the EC2 instance:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/field_force?schema=public&sslmode=require"
OPENAI_API_KEY="sk-..."
PORTAL_PASSWORD="change-this"
S3_UPLOAD_BUCKET="your-bucket-name"
S3_UPLOAD_REGION="ap-south-1"
PORT=3000
HOSTNAME=0.0.0.0
```

Do not commit the real `.env`.

For S3 access, prefer an EC2 instance profile/IAM role with:

```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:PutObject"],
  "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
}
```

## Option A: Run Directly With Node + systemd

Install Node.js, then deploy:

```bash
sudo mkdir -p /opt/haythere
sudo chown -R $USER:$USER /opt/haythere
git clone https://github.com/siddharth310/HayThere.git /opt/haythere
cd /opt/haythere
git checkout feature/haythere-voice-field-platform
npm ci
npm run build
npm run db:deploy
```

Install the service:

```bash
sudo cp docs/haythere.service /etc/systemd/system/haythere.service
sudo systemctl daemon-reload
sudo systemctl enable haythere
sudo systemctl start haythere
sudo systemctl status haythere
```

Deploy updates:

```bash
cd /opt/haythere
git pull
npm ci
npm run build
npm run db:deploy
sudo systemctl restart haythere
```

Health check:

```bash
curl http://127.0.0.1:3000/api/health
```

## Option B: Run With Docker

Build and run:

```bash
cd /opt/haythere
docker build -t haythere:latest .
docker run -d \
  --name haythere \
  --env-file /opt/haythere/.env \
  -p 3000:3000 \
  --restart unless-stopped \
  haythere:latest
```

The container runs `prisma migrate deploy` before starting Next.js.

Deploy updates:

```bash
cd /opt/haythere
git pull
docker build -t haythere:latest .
docker rm -f haythere
docker run -d \
  --name haythere \
  --env-file /opt/haythere/.env \
  -p 3000:3000 \
  --restart unless-stopped \
  haythere:latest
```

## Nginx

Use `docs/nginx-haythere.conf` as a starting point. Replace:

- `example.com`
- certificate paths

Then:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Security Group

Open:

- `22` only from your IP.
- `80` and `443` to the internet.
- Do not expose `3000` publicly if Nginx/ALB fronts the app.

## Notes

- The app expects PostgreSQL now; SQLite is no longer production-compatible.
- Audio is stored in S3 when `S3_UPLOAD_BUCKET` is set.
- `/api/health` is intended for ALB/Nginx/monitoring checks.
