# HTTPS Setup Guide for Camera Access

The barcode scanner requires HTTPS (secure connection) to access the device camera. This is a browser security requirement, not specific to this app.

## ✅ Production (GitHub Pages)

**Good news!** GitHub Pages automatically provides HTTPS.

Your deployed app at `https://weestoater.github.io/weegym/` already has HTTPS enabled. No action needed!

When you deploy with `npm run deploy`, the camera will work on mobile devices.

---

## 🔧 Local Development (HTTPS for Testing)

For testing the camera locally, you have several options:

### Option 1: Use Localhost (Recommended for Quick Testing)

Browsers treat `localhost` as secure even without HTTPS.

1. Run the dev server normally:

   ```bash
   npm run dev
   ```

2. Access via `http://localhost:5173/weegym/`
   - Camera should work on your local machine
   - **Limitation**: Won't work when testing from mobile devices on your network

---

### Option 2: Vite HTTPS Dev Server (Best for Mobile Testing)

Enable HTTPS in your local development environment:

#### Step 1: Create SSL Certificate

```bash
# Install mkcert (one-time setup)
# On Windows (with Chocolatey):
choco install mkcert

# On macOS:
brew install mkcert

# On Linux:
# Download from: https://github.com/FiloSottile/mkcert/releases

# Create local CA
mkcert -install

# Generate certificate (run from project root)
mkcert localhost 127.0.0.1 ::1 192.168.1.* YOUR_LOCAL_IP
```

This creates `localhost+4.pem` and `localhost+4-key.pem` files.

#### Step 2: Update vite.config.js

Add the server configuration:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import fs from "fs";
import path from "path";

export default defineConfig({
  base: "/weegym/",
  server: {
    https: {
      key: fs.readFileSync("./localhost+4-key.pem"),
      cert: fs.readFileSync("./localhost+4.pem"),
    },
    host: true, // Allows access from network
  },
  // ... rest of config
});
```

#### Step 3: Add Certificate Files to .gitignore

```bash
echo "localhost+*.pem" >> .gitignore
```

#### Step 4: Run Dev Server

```bash
npm run dev
```

Access via: `https://localhost:5173/weegym/`

**For Mobile Testing:**

1. Find your computer's local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. On your mobile device (same WiFi): `https://192.168.1.XXX:5173/weegym/`

---

### Option 3: ngrok (Easiest for Mobile Testing)

Create a secure tunnel to your local server without certificates:

#### Step 1: Install ngrok

- Download from: https://ngrok.com/download
- Or: `choco install ngrok` (Windows) / `brew install ngrok` (Mac)

#### Step 2: Run Dev Server

```bash
npm run dev
```

#### Step 3: Create Tunnel

In another terminal:

```bash
ngrok http 5173
```

You'll get a URL like: `https://abc123.ngrok.io`

#### Step 4: Access on Any Device

Open the ngrok URL on any device (mobile, tablet, etc.) - camera will work!

**Pros:**

- No certificate setup needed
- Works on any device
- Free for basic use

**Cons:**

- URL changes every time (unless using paid plan)
- Requires internet connection

---

## 🌐 Alternative Production Hosting (with HTTPS)

If not using GitHub Pages, these hosts also provide free HTTPS:

### Netlify (Recommended)

1. Create account at netlify.com
2. Connect your GitHub repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Auto-deploys on push with HTTPS

### Vercel

1. Create account at vercel.com
2. Import your GitHub repo
3. Vercel auto-detects Vite config
4. HTTPS enabled automatically

### Cloudflare Pages

1. Create account at pages.cloudflare.com
2. Connect GitHub repo
3. Build command: `npm run build`
4. Output directory: `dist`

All provide:

- ✅ Automatic HTTPS
- ✅ Free custom domains
- ✅ Auto-deploy from GitHub
- ✅ CDN for fast loading

---

## 🛠️ Quick Decision Guide

**For Production:**

- Current GitHub Pages → Already has HTTPS ✅
- Want easier deployment → Try Netlify or Vercel

**For Local Development:**

- Quick testing on your computer → Use localhost (no setup needed)
- Testing on mobile device → Use ngrok (easiest) or mkcert (most like production)

---

## 🔍 Verify HTTPS is Working

1. Open your app in a browser
2. Check the address bar:
   - ✅ Shows a lock icon 🔒
   - ✅ URL starts with `https://`
   - ❌ Shows "Not Secure" warning

3. Go to Calorie Tracker → Scan Barcode
4. If HTTPS is working:
   - Browser asks for camera permission
   - Camera feed appears

---

## 🆘 Troubleshooting

### "Not Secure" Warning on Localhost

- On modern browsers, localhost is always treated as secure
- Camera should still work even without the lock icon
- If it doesn't, use one of the HTTPS options above

### Self-Signed Certificate Warning

If using mkcert and seeing certificate warnings:

- Make sure you ran `mkcert -install`
- Restart your browser
- On mobile: Download the CA certificate from your computer

### ngrok "Visit Site" Button

- First time visiting an ngrok URL, click "Visit Site"
- This is normal security to prevent abuse

---

## 📝 Summary

| Environment               | Solution             | Camera Works?    | Setup Effort |
| ------------------------- | -------------------- | ---------------- | ------------ |
| Production (GitHub Pages) | Already HTTPS        | ✅               | None         |
| Local - localhost         | `npm run dev`        | ✅ (local only)  | None         |
| Local - with HTTPS        | mkcert + vite config | ✅ (all devices) | Medium       |
| Local - ngrok             | ngrok tunnel         | ✅ (all devices) | Easy         |
| Other hosts               | Netlify/Vercel       | ✅               | Easy         |

**Recommended:** Deploy to GitHub Pages for production (already configured!), use ngrok for local mobile testing.
