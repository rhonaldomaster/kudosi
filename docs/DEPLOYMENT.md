# Kudos Slack App - Deployment Guide

This guide covers deploying the Kudos app to Railway (recommended) and configuring it for production use.

## Prerequisites

- Railway account (https://railway.app)
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

## Step 3: Deploy to Railway

### 3.1 Create Railway Project

1. Go to https://railway.app and sign in
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Connect your GitHub account and select the `kudos` repository

### 3.2 Add PostgreSQL Database

1. In your Railway project, click **New**
2. Select **Database** > **Add PostgreSQL**
3. Railway will automatically provide `DATABASE_URL`

### 3.3 Configure Environment Variables

In Railway, go to your service and click **Variables**. Add:

```bash
# Slack Credentials (required)
SLACK_BOT_TOKEN=xoxb-your-production-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token

# App Config
PORT=3000
NODE_ENV=production

# Scheduler (optional - for automatic monthly leaderboard)
LEADERBOARD_CHANNEL_ID=C0123456789

# Google Sheets (optional - for export feature)
GOOGLE_SHEETS_ID=your-spreadsheet-id
GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}
```

**Note:** For Google credentials in Railway, paste the entire JSON content as `GOOGLE_CREDENTIALS_JSON` instead of using a file path.

### 3.4 Run Database Migration

Option A: Using Railway CLI
```bash
railway run psql $DATABASE_URL < src/db/migrations/001_initial.sql
```

Option B: Using Railway Dashboard
1. Click on your PostgreSQL service
2. Go to **Data** tab
3. Open **Query** and paste the contents of `001_initial.sql`
4. Execute the query

### 3.5 Deploy

Railway automatically deploys when you push to your connected branch. You can also:
1. Go to **Deployments** tab
2. Click **Deploy** to trigger manually

## Step 4: Verify Deployment

### 4.1 Check Logs

In Railway, go to **Deployments** > select latest > **View Logs**

You should see:
```
Kudos app is running on port 3000
```

### 4.2 Test in Slack

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
| `DATABASE_URL` | Yes | PostgreSQL connection string (auto-provided by Railway) |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | `development` or `production` |
| `LEADERBOARD_CHANNEL_ID` | No | Channel for scheduled leaderboard posts |
| `GOOGLE_SHEETS_ID` | No | Google Sheet ID for export |
| `GOOGLE_CREDENTIALS_JSON` | No | Service account JSON (for production) |
| `GOOGLE_CREDENTIALS_PATH` | No | Path to credentials file (for local dev) |

## Troubleshooting

### App not responding to commands

1. Check Railway logs for errors
2. Verify `SLACK_APP_TOKEN` is correct (Socket Mode token)
3. Ensure Socket Mode is enabled in Slack App settings

### Database connection errors

1. Verify `DATABASE_URL` is set (Railway provides this automatically)
2. Check if migrations were run
3. Look for PostgreSQL service health in Railway dashboard

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
2. Railway automatically redeploys
3. Check deployment logs for success

## Monitoring

Railway provides:
- **Metrics** - CPU, Memory, Network usage
- **Logs** - Real-time application logs
- **Alerts** - Setup notifications for failures

## Rollback

If a deployment causes issues:
1. Go to **Deployments** in Railway
2. Find the previous working deployment
3. Click **Rollback** to restore

## Cost Considerations

Railway pricing (as of 2025):
- **Free tier**: $5 credit/month (good for testing)
- **Pro tier**: $20/month + usage (recommended for production)

PostgreSQL storage and compute are billed based on usage.

## Security Best Practices

1. Never commit `.env` files or credentials to git
2. Use Railway's environment variables for all secrets
3. Rotate Slack tokens periodically
4. Limit Google Sheet access to necessary accounts only
5. Keep dependencies updated (`npm audit`)
