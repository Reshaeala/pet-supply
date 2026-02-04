# How to Start the Application

## Quick Start Guide

### Step 1: Fix Database (if needed)

```bash
cd backend
rm -f db/sqlite.db
node db/seed.js
```

### Step 2: Start Backend Server

Open Terminal 1:

```bash
cd backend
npm start
```

You should see: `Server is running on http://localhost:5000`

### Step 3: Start Frontend Server

Open Terminal 2:

```bash
cd frontend
npm run dev
```

You should see: `Local: http://localhost:3000`

### Step 4: Open Browser

Navigate to: **http://localhost:3000**

## Troubleshooting

### If you see "localhost page cannot be found":

1. **Check if servers are running:**

   ```bash
   # Check port 3000 (frontend)
   lsof -ti:3000

   # Check port 5000 (backend)
   lsof -ti:5000
   ```

2. **If ports are in use, kill the processes:**

   ```bash
   # Kill frontend
   kill -9 $(lsof -ti:3000)

   # Kill backend
   kill -9 $(lsof -ti:5000)
   ```

3. **Restart both servers:**

   - Make sure backend starts first
   - Then start frontend

4. **Check database:**

   ```bash
   cd backend
   node -e "const sqlite3 = require('sqlite3').verbose(); const path = require('path'); const db = new sqlite3.Database(path.join(__dirname, 'db', 'sqlite.db')); db.all('SELECT COUNT(*) as count FROM products', [], (err, rows) => { if (err) console.error('DB Error:', err.message); else console.log('Products:', rows[0].count); db.close(); });"
   ```

5. **Verify the URL:**
   - Make sure you're going to: `http://localhost:3000` (not 5000)
   - The frontend runs on port 3000
   - The backend runs on port 5000 (API only)

### Common Issues:

- **"Cannot GET /"**: Backend is trying to serve frontend but frontend isn't built. Use `npm run dev` in frontend instead.
- **"SQLITE_NOTADB"**: Database is corrupted. Run the seed script again.
- **"Network Error"**: Backend isn't running or proxy isn't configured.

## Expected Behavior

When everything is working:

- Backend: `http://localhost:5000` - Shows API endpoints
- Frontend: `http://localhost:3000` - Shows the React app
- API calls from frontend automatically proxy to backend
