# Ai Botflow CRM — Hostinger KVM Deployment

This app is designed to run on an Ubuntu 22.04 Hostinger KVM VPS with:

- Node.js 22 LTS
- pnpm 10+
- PostgreSQL 16 (local or managed)
- Nginx
- PM2

## 1. Prepare the server

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx postgresql postgresql-contrib
sudo npm install -g pnpm pm2
sudo mkdir -p /var/www/ai-botflow-crm
sudo chown -R $USER:$USER /var/www/ai-botflow-crm
```

Clone the repository into `/var/www/ai-botflow-crm`, then install its locked dependencies:

```bash
cd /var/www/ai-botflow-crm
pnpm install --frozen-lockfile
```

## 2. Configure production variables

Create `/var/www/ai-botflow-crm/.env.production` with private values that are never committed:

```bash
DATABASE_URL=postgresql://ai_botflow:<strong-password>@127.0.0.1:5432/ai_botflow
SESSION_SECRET=<generate-a-long-random-secret>
NODE_ENV=production
TRUSTED_ORIGINS=https://crm.example.com
```

For a local PostgreSQL database:

```bash
sudo -u postgres psql
CREATE USER ai_botflow WITH PASSWORD '<strong-password>';
CREATE DATABASE ai_botflow OWNER ai_botflow;
\q
```

Load the variables before migration or service commands:

```bash
set -a
source .env.production
set +a
```

## 3. Apply the schema and build

```bash
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run build
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/ai-botflow-crm run build
```

Run `pnpm --filter @workspace/db run push` before every release that changes the database schema. Back up PostgreSQL before applying a significant production schema change.

## 4. Run the API with PM2

Create `ecosystem.config.cjs` in the repository root:

```js
module.exports = {
  apps: [
    {
      name: "ai-botflow-api",
      cwd: "/var/www/ai-botflow-crm/artifacts/api-server",
      script: "dist/index.mjs",
      node_args: "--enable-source-maps",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
```

Start the service after loading `.env.production`:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 5. Serve the web app and API through Nginx

The frontend build is written to:

`/var/www/ai-botflow-crm/artifacts/ai-botflow-crm/dist/public`

Create `/etc/nginx/sites-available/ai-botflow-crm`:

```nginx
server {
    listen 80;
    server_name crm.example.com;

    root /var/www/ai-botflow-crm/artifacts/ai-botflow-crm/dist/public;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable HTTPS before putting the CRM into use:

```bash
sudo ln -s /etc/nginx/sites-available/ai-botflow-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo snap install --classic certbot
sudo certbot --nginx -d crm.example.com
```

## 6. Meta channel setup prerequisites

The product includes the channel-connection foundation, but real WhatsApp Embedded Signup, Instagram login, Facebook Page login, webhooks, and message delivery require:

1. A verified Meta Business account and production Meta app.
2. HTTPS callbacks under your production domain.
3. Meta app credentials stored as server-only environment variables.
4. Webhook verification and subscription approval.
5. WhatsApp Business Account and display number approval.

Do not expose Meta secrets in the frontend. Keep provider credentials in the VPS environment manager and use a separate test app before switching live traffic.

## 7. Release checklist

```bash
cd /var/www/ai-botflow-crm
git pull
pnpm install --frozen-lockfile
set -a && source .env.production && set +a
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run build
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/ai-botflow-crm run build
pm2 reload ai-botflow-api --update-env
sudo systemctl reload nginx
```

Verify `https://crm.example.com/api/healthz`, create a fresh account, add a lead, send a test inbox reply, and confirm the site loads after a hard refresh.