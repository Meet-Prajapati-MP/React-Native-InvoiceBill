# InvoiceBill Backend Guide – Click-by-Click (Beginner-Friendly)

Complete step-by-step guide to build and deploy the InvoiceBill backend using **Supabase** as database and **Railway** for hosting. Every step is click-by-click.

---

## Table of Contents
1. [What You'll Build](#1-what-youll-build)
2. [Part A: Install Prerequisites](#2-part-a-install-prerequisites)
3. [Part B: Supabase Database Setup](#3-part-b-supabase-database-setup)
4. [Part C: Create Backend Project (NestJS)](#4-part-c-create-backend-project-nestjs)
5. [Part D: Build APIs – Step by Step](#5-part-d-build-apis-step-by-step)
6. [Part E: Deploy Backend to Railway](#6-part-e-deploy-backend-to-railway)
7. [Part F: Connect React Native App](#7-part-f-connect-react-native-app)
8. [Part G: External Integrations](#8-part-g-external-integrations)
9. [Security & Troubleshooting](#9-security--troubleshooting)

---

## 1. What You'll Build

**Architecture:**
```
[React Native App]  →  [Railway (NestJS API)]  →  [Supabase (PostgreSQL)]
```

**Stack:**
- **Database:** Supabase (PostgreSQL + Auth)
- **Backend API:** NestJS (Node.js) on Railway
- **Your app:** React Native (calls API via HTTPS)

---

## 2. Part A: Install Prerequisites

### A1. Install Node.js (on your computer)

1. Open browser → go to **https://nodejs.org**
2. Click the **LTS** (green) download button
3. Run the installer → Next → Accept → Install
4. Open **PowerShell** or **Command Prompt**
5. Type: `node -v` and press Enter → should show `v20.x.x`
6. Type: `npm -v` and press Enter → should show `10.x.x`

### A2. Install Git

1. Go to **https://git-scm.com/downloads**
2. Download for Windows
3. Run installer → use default options → Install
4. Open PowerShell, type: `git --version` → confirms installation

---

## 3. Part B: Supabase Database Setup

### B1. Create Supabase Account & Project

1. Open browser → **https://supabase.com**
2. Click **Start your project** (top right)
3. Sign in with **GitHub** or **Email**
4. After login, click **New Project**
5. Select your **Organization** (or create one)
6. Fill in:
   - **Name:** `invoicebill`
   - **Database Password:** Create a strong password → **Save it** (you need it later)
   - **Region:** Choose closest to your users (e.g. **Singapore (Southeast Asia)** for India)
7. Click **Create new project**
8. Wait 2–3 minutes until the status shows green/ready

### B2. Run Schema (Create Tables)

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **+ New query**
3. On your computer, open: `m:\REACT NATIVE\InvoiceBill\supabase\schema.sql`
4. Press **Ctrl+A** (select all) → **Ctrl+C** (copy)
5. Click inside the Supabase SQL Editor
6. Press **Ctrl+V** (paste)
7. Click **Run** (or press Ctrl+Enter)
8. You should see: **Success. No rows returned** – all 19 tables are created

### B3. Get Supabase Credentials

1. In Supabase left sidebar, click **Project Settings** (gear icon at bottom)
2. Click **API** under "Project Settings"
3. Copy and save these in a text file:

| What to Copy | Where |
|--------------|-------|
| **Project URL** | "Project URL" section (e.g. `https://xxxxx.supabase.co`) |
| **anon public key** | "Project API keys" → `anon` → copy the long key |
| **service_role key** | "Project API keys" → `service_role` → copy (keep secret!) |

4. Click **Database** in the left sidebar (under Project Settings)
5. Under **Connection string**, select **URI**
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your database password from B1
8. Save the full string – it looks like: `postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres`

### B4. Enable Email Auth

1. Click **Authentication** in the left sidebar
2. Click **Providers**
3. **Email** should be ON by default
4. (Optional) Click **Phone** and enable if you want phone OTP later
5. For testing: **Authentication** → **Users** → **Add user** → create a test user

---

## 4. Part C: Create Backend Project (NestJS)

### C1. Open Terminal & Create Project

1. Open **PowerShell**
2. Go to a folder where you want the backend (e.g. `m:\REACT NATIVE\`)
3. Run:
   ```powershell
   npm i -g @nestjs/cli
   ```
4. Wait for it to finish
5. Run:
   ```powershell
   cd "m:\REACT NATIVE"
   nest new invoicebill-backend
   ```
6. When asked **Which package manager would you like to use?** → Select **npm** (arrow keys + Enter)
7. Wait for the project to be created
8. Run:
   ```powershell
   cd invoicebill-backend
   ```

### C2. Install Required Packages

In the same terminal (inside `invoicebill-backend`), run these one by one:

```powershell
npm install @nestjs/config @supabase/supabase-js @nestjs/passport passport passport-jwt class-validator class-transformer @nestjs/throttler
```

```powershell
npm install -D @types/passport-jwt
```

### C3. Create .env File

1. In your project folder `invoicebill-backend`, create a file named `.env` (no extension)
2. Open it in a text editor and add (replace with your real values from B3):

```
NODE_ENV=development
PORT=3000

# Supabase – from B3
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_anon_key
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_service_role_key

# JWT (generate a random string, e.g. run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_random_32_char_secret_here
```

3. Save the file
4. Add `.env` to `.gitignore` if not already there (so you don't accidentally push secrets)

---

## 5. Part D: Build APIs – Step by Step

### D1. Set Up Config Module

1. In `invoicebill-backend/src`, create `supabase.module.ts`:

```typescript
import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
```

2. Create `supabase.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor(private config: ConfigService) {
    this.client = createClient(
      this.config.get('SUPABASE_URL'),
      this.config.get('SUPABASE_SERVICE_KEY'),
    );
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
```

3. Open `app.module.ts` – add imports at top:

```typescript
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase.module';
import { ThrottlerModule } from '@nestjs/throttler';
```

4. In `@Module({ imports: [...] })`, add at the start of the array:

```typescript
ConfigModule.forRoot({ isGlobal: true }),
ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
SupabaseModule,
```

### D2. Auth Guard (Protect APIs)

1. Create folder `src/auth`
2. Create `auth.guard.ts`:

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException('No token');
    const token = authHeader.slice(7);
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new UnauthorizedException('Invalid token');
    request.user = user;
    return true;
  }
}
```

### D3. Auth Controller (Login, Register)

1. Create `auth.controller.ts` in `src/auth`:

```typescript
import { BadRequestException, Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Controller('auth')
export class AuthController {
  constructor(private supabase: SupabaseService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; full_name?: string }) {
    const { data, error } = await this.supabase.getClient().auth.signUp({
      email: body.email,
      password: body.password,
      options: { data: { full_name: body.full_name } },
    });
    if (error) throw new BadRequestException(error.message);
    return { user: data.user, session: data.session };
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { data, error } = await this.supabase.getClient().auth.signInWithPassword(body);
    if (error) throw new UnauthorizedException(error.message);
    return { user: data.user, session: data.session };
  }

  @Post('logout')
  async logout(@Body() body: { refresh_token?: string }) {
    await this.supabase.getClient().auth.signOut({ scope: 'local' });
    return { success: true };
  }
}
```


2. Create `auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

@Module({ controllers: [AuthController] })
export class AuthModule {}
```

3. In `app.module.ts`, add `AuthModule` to the `imports` array.

### D4. Customers API

1. Create folder `src/customers`
2. Create `customers.controller.ts`:

```typescript
import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('customers')
@UseGuards(AuthGuard)
export class CustomersController {
  constructor(private supabase: SupabaseService) {}

  private getClient() {
    return this.supabase.getClient();
  }

  @Get()
  async list(@Request() req: any) {
    const { data, error } = await this.getClient()
      .from('customers')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  @Post()
  async create(@Request() req: any, @Body() body: any) {
    const { data, error } = await this.getClient()
      .from('customers')
      .insert({ user_id: req.user.id, ...body })
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  @Get(':id')
  async get(@Request() req: any, @Param('id') id: string) {
    const { data, error } = await this.getClient()
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();
    if (error) throw new NotFoundException(error.message);
    return data;
  }

  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const { data, error } = await this.getClient()
      .from('customers')
      .update(body)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  @Delete(':id')
  async delete(@Request() req: any, @Param('id') id: string) {
    const { error } = await this.getClient()
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }
}
```


3. Create `customers.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';

@Module({ controllers: [CustomersController] })
export class CustomersModule {}
```

4. Add `CustomersModule` to `app.module.ts` imports.

### D5. Items API

1. Create folder `src/items`
2. Create `items.controller.ts` (same pattern as customers, using table `items`):

```typescript
import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';
import { AuthGuard } from '../auth/auth.guard';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Controller('items')
@UseGuards(AuthGuard)
export class ItemsController {
  constructor(private supabase: SupabaseService) {}

  @Get()
  async list(@Request() req: any) {
    const { data, error } = await this.supabase.getClient()
      .from('items')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  @Post()
  async create(@Request() req: any, @Body() body: { name: string; rate?: number; description?: string }) {
    const { data, error } = await this.supabase.getClient()
      .from('items')
      .insert({ user_id: req.user.id, ...body })
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  @Get(':id')
  async get(@Request() req: any, @Param('id') id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('items')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();
    if (error) throw new NotFoundException(error.message);
    return data;
  }

  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const { data, error } = await this.supabase.getClient()
      .from('items')
      .update(body)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  @Delete(':id')
  async delete(@Request() req: any, @Param('id') id: string) {
    const { error } = await this.supabase.getClient()
      .from('items')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }
}
```

3. Create `items.module.ts` and add `ItemsModule` to `app.module.ts`.

### D6. Bank Accounts API

Same pattern – controller for `bank_accounts` table with `user_id` filter. Endpoints: `GET`, `POST`, `PATCH`, `DELETE`.

### D7. Invoices API

Create `invoices.controller.ts` – `GET`, `POST`, `GET/:id`, `PATCH/:id`, `DELETE/:id` for `invoices` table. For creating invoices with line items, insert into `invoices` first, then into `invoice_items` with the returned `invoice_id`.

### D8. API Summary (Reference)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/register` | Sign up |
| POST | `/auth/login` | Login (returns access_token) |
| POST | `/auth/logout` | Logout |
| GET | `/customers` | List customers |
| POST | `/customers` | Create customer |
| GET | `/customers/:id` | Get customer |
| PATCH | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |
| GET | `/items` | List items |
| POST | `/items` | Create item |
| PATCH | `/items/:id` | Update item |
| DELETE | `/items/:id` | Delete item |
| GET | `/invoices` | List invoices |
| POST | `/invoices` | Create invoice |
| GET | `/invoices/:id` | Get invoice |
| PATCH | `/invoices/:id` | Update invoice |
| DELETE | `/invoices/:id` | Delete invoice |

### D9. Test Locally

1. In terminal: `npm run start:dev`
2. Open **https://supabase.com** → your project → Authentication → Users → Add user (create test user)
3. Use Postman or curl to test:

```bash
# Login
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"yourpassword\"}"

# Use the access_token from response in:
curl http://localhost:3000/customers -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 6. Part E: Deploy Backend to Railway

### E1. Create Railway Account & Project

1. Open browser → **https://railway.app**
2. Click **Login** (top right) → Sign in with **GitHub** (recommended)
3. After login, click **New Project**
4. Select **Deploy from GitHub repo**
5. If prompted, authorize Railway to access your GitHub
6. Choose your **invoicebill-backend** repository
7. Railway will automatically detect it as a Node.js project and start deploying

### E2. Push Backend to GitHub (if not done)

1. On your computer, go to `invoicebill-backend` folder
2. Ensure `.gitignore` contains:
   ```
   node_modules
   dist
   .env
   ```
3. Run:
   ```powershell
   git init
   git add .
   git commit -m "Initial backend"
   ```
4. Go to **https://github.com** → New repository → name: `invoicebill-backend` → Create
5. Run (replace YOUR_USERNAME with your GitHub username):
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/invoicebill-backend.git
   git branch -M main
   git push -u origin main
   ```
6. Railway will auto-deploy when you push (or you can manually trigger it in the dashboard)

### E3. Configure Environment Variables on Railway

1. In Railway dashboard, click your **invoicebill-backend** service
2. Go to the **Variables** tab
3. Add these variables (from Part B3 – Supabase credentials):

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `SUPABASE_ANON_KEY` | Your anon key from Supabase |
| `SUPABASE_SERVICE_KEY` | Your service_role key from Supabase |
| `JWT_SECRET` | Your random 32+ character secret |

4. **Important:** After saving variables, click **Deploy** (or **Redeploy**) – variable changes are staged until you deploy.
5. Use **Raw Editor** to paste from your local `.env` file if easier (format: `KEY=value` per line).

**Troubleshooting "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set":**
- Variable names must be **exact**: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (all caps, underscores).
- Ensure you added variables to the **correct service** (the one running your backend from the `invoice-back` repo).
- **Redeploy** after adding variables – changes don't apply until deployment completes.
- Check **Settings → Variables** (or **Variables** tab) – both `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` should be listed.

### E4. Configure Build Settings (if needed)

1. Railway auto-detects Node.js – it runs `npm install` and `npm run build`
2. For NestJS, set **Start Command** in Railway → Settings → Deploy:
   - Use `npm run start:prod` or `node dist/main.js` (default `npm start` runs dev mode)
3. Build command is typically `npm run build` (creates `dist/main.js`)
4. Railway injects `PORT` automatically – ensure your `main.ts` uses `process.env.PORT ?? 3000`

### E5. Get Your Public URL

1. In Railway, click your service
2. Go to **Settings** tab
3. Under **Networking**, click **Generate Domain**
4. Railway will assign a URL like: `https://invoicebill-backend-production-xxxx.up.railway.app`
5. Copy this URL – this is your **API_BASE** for production

### E6. (Optional) Add Custom Domain

1. In Railway → your service → **Settings** → **Networking**
2. Click **Custom Domain**
3. Add your domain (e.g. `api.yourdomain.com`)
4. Railway will show CNAME instructions – add the CNAME record at your domain registrar
5. HTTPS is automatic on Railway

### E7. Test Your API

1. Use Postman or curl:
   ```bash
   curl -X POST https://YOUR_RAILWAY_URL/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"yourpassword\"}"
   ```
2. Your API is live at your Railway URL – no SSH, PM2, or Nginx needed!

---

## 7. Part F: Connect React Native App

### F1. Install Axios

```powershell
cd "m:\REACT NATIVE\InvoiceBill"
npm install axios @react-native-async-storage/async-storage
```

### F2. Create API Config

Create `src/config/api.ts`:

```typescript
export const API_BASE = __DEV__
  ? 'http://YOUR_COMPUTER_IP:3000'   // Use your PC's IP for physical device (local dev)
  : 'https://YOUR_APP.up.railway.app'; // Your Railway URL from E5
```

### F3. Create API Service

Create `src/services/api.ts`:

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### F4. Use in Your Screens

```typescript
import { api } from '../services/api';

// Login
const { data } = await api.post('/auth/login', { email, password });
await AsyncStorage.setItem('access_token', data.session.access_token);

// Fetch customers
const { data: customers } = await api.get('/customers');
```

---

## 8. Part G: External Integrations

| Service | Purpose | Link |
|---------|---------|------|
| **Neokred** | Bank verification, UPI, payments | https://neokred.com |
| **MSG91 / Twilio** | SMS OTP | https://msg91.com, https://twilio.com |
| **Firebase** | Push notifications | https://console.firebase.google.com |

Add these after your core APIs work.

---

## 9. Security & Troubleshooting

### Security Checklist
- [ ] Never commit `.env` to Git
- [ ] Use HTTPS in production
- [ ] Store JWT in secure storage (AsyncStorage for dev; Keychain for production)
- [ ] Supabase RLS is enabled (you ran schema.sql)
- [ ] Rate limiting is on (ThrottlerModule)

### Troubleshooting

| Problem | Fix |
|---------|-----|
| Can't connect to API from app | Use computer's LAN IP for dev (e.g. `192.168.1.5`), not `localhost`. For production, ensure `API_BASE` uses your Railway URL with `https://`. |
| "Invalid token" | Ensure you're sending `Authorization: Bearer <access_token>` and token is fresh. |
| Railway deploy failed | Check **Deployments** tab in Railway for build logs. Ensure all env vars are set. Verify `npm run build` works locally. |
| Supabase "permission denied" | RLS policies require `user_id = auth.uid()`. Backend uses `service_role` key which bypasses RLS – ensure you're filtering by `user_id` in your API code. |
| Railway app unreachable | Generate a public domain in Railway → Settings → Networking. Ensure PORT is not hardcoded (Railway injects `PORT` automatically). |

---

## Quick Reference

| Step | Where | Action |
|------|-------|--------|
| B1 | supabase.com | New Project → Name, password, region |
| B2 | Supabase SQL Editor | Run `supabase/schema.sql` |
| B3 | Supabase Project Settings → API | Copy URL, anon key, service_role key |
| C1 | Local PC | `nest new invoicebill-backend` |
| D1–D7 | Backend project | Create modules, controllers, guards |
| E1 | railway.app | New Project → Deploy from GitHub repo |
| E2 | Local + GitHub | Push backend to GitHub |
| E3 | Railway → Variables | Add SUPABASE_*, JWT_SECRET, NODE_ENV |
| E5 | Railway → Settings → Networking | Generate Domain → copy URL |
| E6 | Railway (optional) | Add custom domain with CNAME |

---

## Summary Checklist

- [ ] Node.js installed
- [ ] Supabase project created
- [ ] Schema run in SQL Editor
- [ ] Supabase URL, keys saved
- [ ] NestJS backend created locally
- [ ] Supabase + Auth + Customers + Items (and more) APIs built
- [ ] Backend runs with `npm run start:dev`
- [ ] Backend pushed to GitHub
- [ ] Railway project created, repo connected
- [ ] Environment variables set in Railway
- [ ] Railway domain generated, URL copied
- [ ] React Native app uses API_BASE (Railway URL for production) and api service
