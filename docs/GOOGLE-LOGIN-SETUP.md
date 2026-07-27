# TryAMM Google Login Setup

The application code is wired. The site owner must create the private Google Cloud credential and add the Client ID to the hosting environment.

## Google Cloud

1. Open Google Cloud Console and create or select the TryAMM project.
2. Configure Google Auth Platform / OAuth consent screen.
3. Choose External audience for public Google accounts.
4. Add TryAMM name, support email, developer email, homepage, privacy policy and terms URLs.
5. Create an OAuth Client ID with application type **Web application**.
6. Add authorized JavaScript origins:
   - `https://tryamm.online`
   - the exact staging origin, such as `https://your-service.onrender.com`
   - `http://localhost:10000` for local testing
7. This implementation uses Google Identity Services ID tokens, so no redirect URI is required for the button flow. Do not add a client secret to browser code.
8. Copy the Web Client ID.

## Hosting environment

Add:

```env
GOOGLE_CLIENT_ID=000000000000-example.apps.googleusercontent.com
APP_URL=https://tryamm.online
```

Restart or redeploy the server.

## Verification

1. Open `/api/auth/google/config` and confirm `enabled` is true.
2. Open the homepage in a private browser window.
3. Select Sign in.
4. Select Continue with Google.
5. Confirm the dashboard displays the Google account name.
6. Sign out, sign in again and confirm the same TryAMM user is reused.
7. Confirm a Google account cannot sign in using an empty password through the email form.

## Security

- Never commit a Google client secret.
- The Web Client ID is public and may be exposed to the browser.
- The server verifies the signed Google ID token and its audience before creating a TryAMM session.
- Use HTTPS in production.
