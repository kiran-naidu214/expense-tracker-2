# 🏠 Room Expense Tracker

A production-ready React app for tracking shared room expenses — with a real Supabase database, so your data syncs across devices.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 + custom CSS |
| Database | Supabase (PostgreSQL) |
| Icons | Lucide React |
| Fonts | Syne + DM Sans |

## Features

- 🔐 **Room codes** — share a code, everyone joins the same room
- 💾 **Real database** — data stored in Supabase, syncs across devices
- 💸 **Expense tracking** — add, edit, delete expenses with categories
- 💰 **Deposit tracking** — track who put money in the pot
- 📊 **Smart summary** — per-person balance, total pot, total spent
- 👥 **Roommate management** — add, rename, remove roommates
- 📝 **Shared notes** — WiFi password, shopping list, etc.
- 🌑 **Dark theme** — sleek dark UI

---

## Setup (5 minutes)

### Step 1 — Create Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project**, give it a name

### Step 2 — Run the SQL schema

1. In your Supabase dashboard → **SQL Editor** → **New Query**
2. Paste the contents of `SUPABASE_SCHEMA.sql` and click **Run**

### Step 3 — Get your credentials

1. Go to **Project Settings → API**
2. Copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key

### Step 4 — Configure the app

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5 — Run

```bash
npm install
npm run dev
```

Open http://localhost:5173 — enter any room code and start tracking!

---

## How Room Codes Work

- Enter any code (e.g. `ROOM101`) → creates a new room automatically
- Share that same code with roommates → everyone sees the same data
- Data is stored in Supabase and syncs in real-time
