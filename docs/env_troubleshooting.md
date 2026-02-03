# Environment Variables Troubleshooting Checklist

## ✅ Step-by-Step Verification

### 1. Check if .env.local file exists

```bash
# In your terminal, run:
cd /d/git/aws/weegym
ls -la .env.local
```

If you get "No such file", create it:

```bash
touch .env.local
```

### 2. Verify .env.local content

Your `.env.local` file should look EXACTLY like this (with your actual values):

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

**Important:**

- ✅ No quotes around the values
- ✅ No spaces around the `=`
- ✅ Keys must start with `VITE_` for Vite to expose them
- ✅ File must be named `.env.local` (with the dot at the start)
- ✅ File must be in the root folder (same level as package.json)

### 3. Get your Supabase credentials

1. Go to your Supabase project dashboard
2. Click **Settings** (gear icon)
3. Click **API**
4. Copy these TWO values:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon public** key → This is your `VITE_SUPABASE_ANON_KEY`

### 4. Restart dev server

Environment variables are only loaded when the dev server starts!

```bash
# Stop the server (Ctrl+C or close terminal)
# Then restart:
yarn dev
```

### 5. Check browser console

1. Open your app in the browser
2. Press F12 to open DevTools
3. Look at the Console tab
4. You should see:
   ```
   🔧 Supabase Configuration Check:
   URL exists: true
   Key exists: true
   URL starts with: https://xxxxx...
   ```

If you see `false` for either:

- Your .env.local file is not being read
- You haven't restarted the server
- The file is in the wrong location

### 6. Common mistakes

❌ **Wrong filename**

- `.env` won't work - must be `.env.local`
- `env.local` won't work - needs the dot

❌ **Wrong location**

- File must be in `/d/git/aws/weegym/` (root folder)
- NOT in `/d/git/aws/weegym/src/`

❌ **Quotes around values**

```bash
# ❌ Wrong:
VITE_SUPABASE_URL="https://xxx.supabase.co"

# ✅ Correct:
VITE_SUPABASE_URL=https://xxx.supabase.co
```

❌ **Spaces around equals**

```bash
# ❌ Wrong:
VITE_SUPABASE_URL = https://xxx.supabase.co

# ✅ Correct:
VITE_SUPABASE_URL=https://xxx.supabase.co
```

❌ **Forgot to restart server**

- Changes to .env.local require server restart

## 🔍 Quick Test Command

Run this in your terminal to check if the file exists and has content:

```bash
cat /d/git/aws/weegym/.env.local
```

You should see your two environment variables.

## 🆘 Still Not Working?

If you're still seeing the error:

1. **Check the exact error message** - What does it say?
2. **Share the console output** - What do you see for the config check?
3. **Verify file location**: Run `pwd` in terminal, then `ls .env.local`
4. **Try .env instead**: Temporarily try naming it `.env` (but .env.local is preferred)

## 🎯 What the console should show

### ✅ Good (Working):

```
🔧 Supabase Configuration Check:
URL exists: true
Key exists: true
URL starts with: https://abcdefghijk...
```

### ❌ Bad (Not Working):

```
🔧 Supabase Configuration Check:
URL exists: false
Key exists: false
❌ Missing Supabase configuration!
```

If you see the "Bad" output, the .env.local file is not being loaded.
