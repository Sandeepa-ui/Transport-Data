# Employee Transport Management System

This is a static single-page application. It can be hosted on GitHub Pages and
optionally uses Google Drive as its shared JSON database through Google Apps
Script.

## Publish on GitHub Pages

1. Create a GitHub repository and upload the contents of this folder.
2. Push the default branch as `main`.
3. In **Settings → Pages**, choose **GitHub Actions** as the source.
4. The included workflow at `.github/workflows/pages.yml` deploys the site after
   each push. The Pages URL is shown in the workflow run.

`drive-config.js` is intentionally committed with an empty URL. This allows
the application to run locally with browser storage until Drive is configured.

## Configure Google Drive storage

1. Open [script.google.com](https://script.google.com/) and create a standalone
   Apps Script project.
2. Copy `google-apps-script/Code.gs` into the project and use the included
   `google-apps-script/appsscript.json` as the manifest.
3. In **Project Settings → Script properties**, add:
   - `DRIVE_FOLDER_ID`: optional Google Drive folder ID. Leave it out to use
     the script owner's Drive root.
   - `APP_KEY`: optional long random application key. If set, copy the same
     value into `drive-config.js`.
4. Deploy **Deploy → New deployment → Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Copy the deployed `/exec` URL into `drive-config.js`:

   ```js
   window.IMO_DRIVE_CONFIG = {
     url: 'https://script.google.com/macros/s/DEPLOYMENT_ID/exec',
     key: 'same-value-as-app-script-APP_KEY'
   };
   ```

6. Commit and push `drive-config.js`. Reload the Pages site.

The first save creates `imo-transport-database.json` in the selected Drive
folder. Existing browser data is uploaded when a save occurs. When the site
loads, a valid Drive database takes precedence; if Drive is unavailable, the
application continues using local browser storage and shows a warning.

## Important security notes

- This frontend contains demo accounts and is not suitable for sensitive
  production data without replacing the client-side authentication.
- GitHub Pages is public. Never put Google credentials, OAuth tokens, or
  private API secrets in `drive-config.js`.
- Anyone with access to the deployed web app can submit requests if the Apps
  Script deployment is public. Use an unguessable `APP_KEY`, restrict the
  deployment to your Google Workspace when appropriate, and treat the stored
  JSON as application data rather than a security boundary.
- Keep the downloadable JSON backup feature enabled so the database can be
  recovered independently of Google Drive.
