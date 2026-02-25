# Deploy on Netlify

## Option 1: Deploy with Git (recommended)

1. Push this project to GitHub / GitLab / Bitbucket.
2. Log in to [Netlify](https://www.netlify.com) → **Add new site** → **Import an existing project**.
3. Choose your Git provider and select the repo.
4. **If the app is inside a folder** (e.g. `react-app`):
   - Set **Base directory** to `react-app`.
   - Netlify will use `react-app/netlify.toml` and run build from there.
5. **Build command:** `npm run build` (from netlify.toml).  
   **Publish directory:** `dist` (from netlify.toml).  
   You can leave these blank; `netlify.toml` sets them.
6. Click **Deploy site**.

## Option 2: Deploy without Git (drag & drop)

1. In the project folder, run:
   ```bash
   cd react-app
   npm install
   npm run build
   ```
2. In Netlify: **Add new site** → **Deploy manually**.
3. Drag and drop the **`dist`** folder (inside `react-app`) into the Netlify drop zone.

---

After deploy, your site will be at `https://<random-name>.netlify.app`. You can set a custom domain in Site settings.
