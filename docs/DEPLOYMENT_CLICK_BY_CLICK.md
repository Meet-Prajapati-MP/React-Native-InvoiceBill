# Click-by-Click Backend Guide: Supabase + Hostinger VPS

This guide walks you through setting up **Supabase** as your database and deploying your backend on **Hostinger VPS KVM 2** – step by step, click by click.

---

## Part A: Supabase (Database) Setup

### A1. Create Supabase Account & Project

1. Open your browser → go to **https://supabase.com**
2. Click **Start your project** (top right)
3. Sign in with **GitHub** or **Email**
4. Click **New Project**
5. Fill in:
   - **Name:** `invoicebill`
   - **Database Password:** Create a strong password (save it somewhere safe)
   - **Region:** Choose closest to your users (e.g. `Singapore` for India)
6. Click **Create new project**
7. Wait 2–3 minutes for the project to be ready

---

### A2. Run Your Schema (Create Tables)

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **+ New query**
3. Open your project folder → `supabase/schema.sql`
4. Copy **all** the contents (Ctrl+A, Ctrl+C)
5. Paste into the Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see **Success. No rows returned** – tables are created

---

### A3. Get Supabase Credentials

1. In the left sidebar, click **Project Settings** (gear icon)
2. Click **API** under Project Settings
3. Copy and save these values:

| Value | Where to find |
|-------|---------------|
| **Project URL** | Under "Project URL" |
| **anon (public) key** | Under "Project API keys" → `anon` `public` |
| **service_role key** | Under "Project API keys" → `service_role` (keep secret!) |

4. Click **Database** in the left sidebar
5. Under **Connection string**, select **URI**
6. Copy the connection string – it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual database password (from A1)
8. Save this – your backend will use it to connect to Supabase

---

### A4. Enable Email Auth (Optional – for OTP later)

1. Click **Authentication** → **Providers**
2. **Email** should be enabled by default
3. For **Phone** (OTP): Enable it if needed later
4. For testing: Go to **Authentication** → **Users** → **Add user** to create a test user manually

---

## Part B: Hostinger VPS KVM 2 Setup

### B1. Access Your VPS

1. Log in to **https://hpanel.hostinger.com**
2. Go to **VPS** in the main menu
3. Click your **KVM 2** plan
4. Note your **IP address** (e.g. `123.45.67.89`)
5. Note **Root password** (or reset it if needed)

**Connect via SSH:**
- **Windows:** Use PowerShell or install [PuTTY](https://putty.org/) or [Windows Terminal](https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701)
- **Mac/Linux:** Use Terminal

```bash
ssh root@YOUR_VPS_IP
```
Enter the root password when asked.

---

### B2. Initial Server Setup (First Login)

Run these commands one by one:

```bash
# Update system packages
apt update && apt upgrade -y

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node -v   # Should show v20.x.x
npm -v    # Should show 10.x.x

# Install Git
apt install -y git

# Install PM2 (to keep your app running)
npm install -g pm2
```

---

### B3. Create User for Your App (Recommended)

```bash
# Create user 'invoicebill'
adduser invoicebill

# Give sudo (optional, for maintenance)
usermod -aG sudo invoicebill

# Switch to this user
su - invoicebill
```

---

### B4. Upload Your Backend Code to VPS

**Option 1: Push to GitHub, then pull on VPS**

1. On your computer:
   - Create a folder `invoicebill-backend` (outside InvoiceBill)
   - Run `nest new invoicebill-backend` if you haven’t already
   - Push to a **private** GitHub repo

2. On the VPS (as `invoicebill` or `root`):

```bash
cd /home/invoicebill   # or /root if using root
git clone https://github.com/YOUR_USERNAME/invoicebill-backend.git
cd invoicebill-backend
```

**Option 2: Use SFTP (FileZilla/WinSCP)**

1. Install [FileZilla](https://filezilla-project.org/) or [WinSCP](https://winscp.net/)
2. Connect:
   - **Host:** `sftp://YOUR_VPS_IP`
   - **Username:** `root` (or `invoicebill`)
   - **Password:** Your VPS root password
3. Upload your `invoicebill-backend` folder to `/home/invoicebill/invoicebill-backend`

---

### B5. Configure Environment on VPS

1. On the VPS, go to your backend folder:
   ```bash
   cd /home/invoicebill/invoicebill-backend
   ```

2. Create `.env` file:
   ```bash
   nano .env
   ```

3. Add these (replace with your real values):

   ```
   NODE_ENV=production
   PORT=3000

   # Supabase
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_KEY=your_service_role_key_here

   # Database (if your backend uses TypeORM to connect directly)
   DB_HOST=db.YOUR_PROJECT_REF.supabase.co
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_database_password
   DB_NAME=postgres
   ```

4. Save: `Ctrl+O`, Enter, then `Ctrl+X`

---

### B6. Install Dependencies & Build

```bash
cd /home/invoicebill/invoicebill-backend

# Install dependencies
npm install

# Build (for NestJS)
npm run build

# Start with PM2
pm2 start dist/main.js --name invoicebill-api

# Make it start on server reboot
pm2 save
pm2 startup
```

---

### B7. Open Port 3000 (Firewall)

```bash
# Allow port 3000
ufw allow 3000
ufw allow 22    # Keep SSH open
ufw enable
ufw status
```

---

### B8. Test Your API

1. On your computer, open a browser or use curl:
   ```
   http://YOUR_VPS_IP:3000
   ```
2. You should get a response from your backend (e.g. "Hello World" or similar)

---

## Part C: Add Nginx (HTTPS, Domain)

Use this when you have a domain (e.g. `api.yourdomain.com`).

### C1. Point Domain to VPS

1. In Hostinger (or your domain registrar):
   - Add an **A record**: `api.yourdomain.com` → `YOUR_VPS_IP`

2. Wait 5–30 minutes for DNS to propagate

---

### C2. Install Nginx & Certbot

```bash
apt install -y nginx certbot python3-certbot-nginx
```

---

### C3. Configure Nginx

```bash
nano /etc/nginx/sites-available/invoicebill
```

Paste (replace `api.yourdomain.com`):

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:

```bash
ln -s /etc/nginx/sites-available/invoicebill /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

### C4. Get SSL (HTTPS)

```bash
certbot --nginx -d api.yourdomain.com
```

Follow the prompts (email, agree to terms). Certbot will configure HTTPS automatically.

---

## Part D: Connect React Native App

1. In your React Native project, create or update `src/config/env.ts`:

```typescript
export const API_BASE = __DEV__
  ? 'http://YOUR_COMPUTER_IP:3000'  // Local dev
  : 'https://api.yourdomain.com';   // Production
```

2. Use this URL in your API service (Axios/fetch) for all backend calls.

---

## Quick Reference

| Step | Where | Action |
|------|-------|--------|
| A1 | supabase.com | New Project → Name, password, region |
| A2 | Supabase SQL Editor | Run `supabase/schema.sql` |
| A3 | Supabase Project Settings → API | Copy URL, anon key, service_role key |
| B1 | hpanel.hostinger.com | Get VPS IP, root password |
| B2 | SSH | `apt update`, install Node.js 20, PM2 |
| B4 | VPS | Clone repo or SFTP upload |
| B5 | VPS | Create `.env` with Supabase credentials |
| B6 | VPS | `npm install`, `npm run build`, `pm2 start` |
| B7 | VPS | `ufw allow 3000` |
| C4 | VPS | `certbot --nginx -d api.yourdomain.com` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Can’t connect to API from app | 1. Check `ufw` allows 3000. 2. Check Hostinger firewall in hPanel. 3. Use `http://IP:3000` not `https` until Nginx/SSL is set. |
| PM2 app crashes | Run `pm2 logs invoicebill-api` to see errors. Fix `.env` or code, then `pm2 restart invoicebill-api` |
| Supabase connection failed | Verify DB_HOST, DB_PASSWORD, and that Supabase allows connections (check Project Settings → Database → Connection pooling) |
| 502 Bad Gateway | Backend not running. Run `pm2 status` and `pm2 start invoicebill-api` |

---

## Summary Checklist

- [ ] Supabase project created
- [ ] Schema run in SQL Editor
- [ ] API keys and DB URL saved
- [ ] VPS accessible via SSH
- [ ] Node.js 20 + PM2 installed
- [ ] Backend code on VPS
- [ ] `.env` configured
- [ ] `pm2 start` running
- [ ] Port 3000 open
- [ ] (Optional) Domain + Nginx + SSL
