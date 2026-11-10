# Kudos Slack App - Deployment Guide

This guide covers deploying the Kudos app to a Coolify server and configuring it for production use.

Items marked **TO CONFIRM** are not verified from this repo. Check them against the live Coolify setup and update this guide.

## Prerequisites

- Access to the Coolify server (https://coolify.io/docs)
- Slack App configured (see below)
- Google Cloud project with Sheets API enabled (for export feature)

## Step 1: Prepare Slack App for Production

### 1.1 Update Slack App Settings

1. Go to https://api.slack.com/apps and select your app
2. Navigate to **Socket Mode** and ensure it's enabled
3. Under **OAuth & Permissions**, verify these scopes:
   ```
   chat:write
   chat:write.public
   commands
   im:write
   users:read
   channels:read
   groups:read
   groups:write
   ```
4. Under **Slash Commands**, ensure these are registered:
   - `/kudos` - Send kudos to teammates
   - `/kudos-stats` - View leaderboard
   - `/kudos-export` - Export to Google Sheets

### 1.2 Get Production Tokens

From your Slack App dashboard, collect:
- **Bot User OAuth Token** (`xoxb-...`) from OAuth & Permissions
- **Signing Secret** from Basic Information
- **App-Level Token** (`xapp-...`) from Basic Information > App-Level Tokens

## Step 2: Setup Google Sheets (Optional)

If you want the export feature:

### 2.1 Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable the **Google Sheets API**

### 2.2 Create Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Create a new service account
3. Download the JSON credentials file
4. Note the service account email (ends with `@...iam.gserviceaccount.com`)

### 2.3 Setup Google Sheet

1. Create a new Google Sheet
2. Share it with the service account email (Editor access)
3. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID_HERE]/edit
   ```

## Step 3: Setup Giphy (Optional)

If you want the GIF search feature in the kudos modal:

1. Go to https://developers.giphy.com and sign in (or create an account)
2. Click **Create an App**
3. Select **API** (not SDK)
4. Give it a name and description
5. Copy the **API Key** from your app dashboard
6. Add it as `GIPHY_API_KEY` in your environment variables

## Step 4: Deploy to Coolify

### 4.1 Create the Application

1. In Coolify, create a new application from the `kudos` GitHub repository
2. Pick the production branch (TO CONFIRM: branch name)
3. Pick a build pack (TO CONFIRM: the repo has no Dockerfile or Nixpacks config, so check which build pack the live app uses)

The app uses Socket Mode, so it needs no public URL or domain for Slack.

### 4.2 Add PostgreSQL Database

1. In the same Coolify project, add a PostgreSQL database resource (TO CONFIRM: the live app may use a different database host)
2. Start it and wait until it is healthy
3. Copy the **Postgres URL (internal)** and use it as `DATABASE_URL`. Coolify does not set `DATABASE_URL` for you. The internal URL only works for applications on the same Coolify destination network.

### 4.3 Configure Environment Variables

In Coolify, open the application and go to its environment variables. Add:

```bash
# Slack Credentials (required)
SLACK_BOT_TOKEN=xoxb-your-production-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token

# App Config
PORT=3000
NODE_ENV=production

# Giphy (optional - for GIF search in kudos modal)
GIPHY_API_KEY=your-giphy-api-key

# Scheduler (optional - for automatic monthly leaderboard)
LEADERBOARD_CHANNEL_ID=C0123456789

# General channel fallback (optional - used when no channel is selected in the kudos modal)
GENERAL_CHANNEL_ID=C0123456789

# Google Sheets (optional - for export feature)
GOOGLE_SHEETS_ID=your-spreadsheet-id
GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}
```

**Note:** On the server, paste the entire JSON content as `GOOGLE_CREDENTIALS_JSON` instead of using a file path.

### 4.4 Run Database Migration

Migrations are not run by the app. Run them once against the production database.

Option A: From your machine, if the database is reachable from it (TO CONFIRM: Coolify databases are private by default)
```bash
psql $DATABASE_URL -f src/db/migrations/001_initial.sql
```

Option B: From the Coolify database **Terminal** page (available when the team and server allow terminal access)
1. Open the PostgreSQL resource and go to **Terminal**
2. Run `psql` inside the container and paste the contents of `001_initial.sql`

### 4.5 Deploy

Coolify can deploy on push if **Advanced > Deployment > Auto deploy** is set to **Deploy on push (webhooks)** (TO CONFIRM: whether it is enabled for this app). You can also trigger a deployment manually from the application page.

## Step 5: Verify Deployment

### 5.1 Check Logs

In Coolify, open the application and go to **Deployment Logs** for the latest deployment

You should see:
```
Kudos app is running on port 3000
```

### 5.2 Test in Slack

1. Go to your Slack workspace
2. Type `/kudos` - should open the modal
3. Send a test kudos
4. Type `/kudos-stats` - should show leaderboard
5. Type `/kudos-export` - should export to Google Sheets (if configured)

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `SLACK_BOT_TOKEN` | Yes | Bot token starting with `xoxb-` |
| `SLACK_SIGNING_SECRET` | Yes | From Slack app Basic Information |
| `SLACK_APP_TOKEN` | Yes | App token starting with `xapp-` |
| `DATABASE_URL` | Yes | PostgreSQL connection string (use the internal Postgres URL from Coolify) |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | `development` or `production` |
| `GIPHY_API_KEY` | No | Giphy API key for GIF search in kudos modal |
| `LEADERBOARD_CHANNEL_ID` | No | Channel for scheduled leaderboard posts |
| `GENERAL_CHANNEL_ID` | No | Fallback channel when no channel is selected in the kudos modal |
| `GOOGLE_SHEETS_ID` | No | Google Sheet ID for export |
| `GOOGLE_CREDENTIALS_JSON` | No | Service account JSON (for production) |
| `GOOGLE_CREDENTIALS_PATH` | No | Path to credentials file (for local dev) |

## Troubleshooting

### App not responding to commands

1. Check the Coolify logs for errors
2. Verify `SLACK_APP_TOKEN` is correct (Socket Mode token)
3. Ensure Socket Mode is enabled in Slack App settings

### Database connection errors

1. Verify `DATABASE_URL` is set in the Coolify environment variables
2. Check if migrations were run
3. Check the PostgreSQL resource is running and healthy in Coolify
4. If you see `ECONNREFUSED`, the host in `DATABASE_URL` is not reachable from where the app runs (for example, `localhost` with no local database)

### Google Sheets export failing

1. Verify `GOOGLE_SHEETS_ID` is correct
2. Check service account has Editor access to the sheet
3. Ensure `GOOGLE_CREDENTIALS_JSON` contains valid JSON

### Commands not appearing in Slack

1. Go to Slack App > Slash Commands
2. Verify commands are registered with correct names
3. Reinstall the app to workspace if needed

## Updating the App

1. Push changes to your GitHub repository
2. Coolify redeploys if auto deploy is enabled, otherwise trigger a deployment manually (see 4.5)
3. Check deployment logs for success

## Monitoring

- **Logs** - Deployment logs and application logs in Coolify
- Other monitoring and alerts: TO CONFIRM

## Rollback

If a deployment causes issues:
1. Open the application in Coolify and go to **Rollback**
2. Under **Available images**, pick the previous working deployment
3. Select **Roll back to this image** and follow **Deployment Logs**

Rollback only deploys an older application image. It does not undo database migrations or restore data. Images are only listed while Coolify still retains them (see **Images to keep** in the application settings).

## Cost Considerations

The app runs on a Coolify server, so cost is the server cost. TO CONFIRM: which server and plan.

## Security Best Practices

1. Never commit `.env` files or credentials to git
2. Use Coolify's environment variables for all secrets
3. Rotate Slack tokens periodically
4. Limit Google Sheet access to necessary accounts only
5. Keep dependencies updated (`npm audit`)
