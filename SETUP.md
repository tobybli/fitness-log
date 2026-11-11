# Training Log app on GitHub Pages (no Google banner)

The app page lives on GitHub Pages, and your Google Sheet only stores the data. You keep the same **Log** and **State** tabs, and your existing progress carries over because it's the same sheet.

Files in this folder:
- **For GitHub:** `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`
- **For Apps Script:** `Code.gs`. Don't upload this one to GitHub.

Do steps 1 to 4 on a computer.

## 1. Make the GitHub repository
1. Sign up at github.com if you don't have an account. It's free.
2. Click **+ > New repository**. Name it `training-log`, set it to **Public**, tick **Add a README file**, then click **Create repository**.

## 2. Upload the app
1. In the repository, click **Add file > Upload files**.
2. Drag in the six GitHub files listed above, then click **Commit changes**.

## 3. Turn on GitHub Pages
1. Go to **Settings > Pages**.
2. Under **Build and deployment**, set Source to *Deploy from a branch*, Branch to *main* and folder to */ (root)*, then click **Save**.
3. After about a minute the page shows your link, `https://<your-username>.github.io/training-log/`.

## 4. Update the Google Sheet script
1. Open your Training Log sheet, then **Extensions > Apps Script**.
2. Replace everything in `Code.gs` with the new **Code.gs** from this folder. You can delete the `Index.html` file there, because it isn't needed any more.
3. Click **Deploy > New deployment**, choose **Web app**, set **Execute as** to *Me* and **Who has access** to *Anyone*, then click **Deploy**. Authorize it if asked.
   "Anyone" lets the app reach the sheet from GitHub. The script only accepts requests that carry your private key, so nobody else can read or change your data.
4. Copy the new **Web app URL**. Under **Manage deployments** you can archive the old "Only myself" deployment.

## 5. Install it on your Samsung A52s
1. On the phone, open the new web app URL in Chrome. You'll see the banner one last time on a page called **Connect your Training Log app**. Tap **Copy code**.
2. Open `https://<your-username>.github.io/training-log/` in Chrome.
3. Tap **⋮ > Install app** (on some phones it's called **Add to home screen > Install**). It gets its own icon and opens full screen.
4. Open the app, tap **Google Sheet**, paste the code, and tap **Connect**. Your saved progress loads from the sheet.
5. Delete the old home-screen shortcut.

## Good to know
- The app opens without signal. Ticks made offline are sent to the sheet the next time you're online.
- Keep the connection code private. If it ever leaks, delete the `APP_KEY` property under **Project Settings > Script Properties** in Apps Script. Then open the web app link again to get a new code.
- To update the app later, upload the new `index.html` to the repository again. The phone picks it up the next time you open the app.
