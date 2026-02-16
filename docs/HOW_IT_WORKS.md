# Kudos Slack App - How It Works

## Overview

Kudos is a Slack app for employee recognition at Koombea. It allows team members to send kudos to their colleagues, track recognition stats, and export data to Google Sheets.

## Tech Stack

| Component | Technology               |
| --------- | ------------------------ |
| Backend   | Node.js + Bolt for Slack |
| Database  | PostgreSQL               |
| Hosting   | Railway (production)     |
| Export    | Google Sheets API        |
| UI        | Slack Block Kit          |

## Features

### Core Features

1. **`/kudos` Command** - Opens an interactive modal to send kudos
2. **Multi-recipient Support** - Send kudos to multiple people at once
3. **Categories** - Configurable kudos categories (Teamwork, Innovation, etc.)
4. **Delivery Mode** - Post to a channel or send privately via DM only
5. **GIF Search** - Search and attach Giphy GIFs to kudos
6. **Custom Image URL** - Paste an image URL as an alternative to GIF search
7. **DM Notifications** - Recipients get notified via direct message

### Additional Features

8. **`/kudos-stats`** - View leaderboard (weekly/monthly/all-time)
9. **`/kudos-export`** - Export kudos data to Google Sheets
10. **Scheduled Leaderboard** - Automatic monthly leaderboard posts

## Project Structure

```
kudos/
├── src/
│   ├── app.js                 # Entry point, Bolt app setup
│   ├── commands/
│   │   ├── kudos.js           # /kudos command handler
│   │   ├── kudosStats.js      # /kudos-stats command handler
│   │   └── kudosExport.js     # /kudos-export command handler
│   ├── views/
│   │   └── kudosModal.js      # Modal Block Kit builder
│   ├── actions/
│   │   ├── submitKudos.js     # Modal submission handler
│   │   └── searchGifs.js      # GIF search action handler
│   ├── services/
│   │   ├── giphy.js           # Giphy API integration
│   │   ├── i18n.js            # Internationalization (en/es)
│   │   └── sheetsExport.js    # Google Sheets integration
│   ├── locales/
│   │   ├── en.json            # English translations
│   │   └── es.json            # Spanish translations
│   ├── db/
│   │   ├── connection.js      # PostgreSQL connection
│   │   ├── queries.js         # Database queries
│   │   └── migrations/        # SQL migrations
│   └── scheduler/
│       └── leaderboardJob.js  # Cron job for scheduled posts
├── docs/
├── .env.example
└── package.json
```

## Database Schema

### Tables

**categories** - Configurable kudos categories

- `id` - Primary key
- `name` - Category name (e.g., "Teamwork")
- `emoji` - Category emoji (e.g., "handshake")
- `active` - Whether the category is active

**kudos** - Stored kudos records

- `id` - Primary key
- `sender_id` - Slack user ID
- `message` - Kudos message text
- `category_id` - Foreign key to categories
- `channel_id` - Slack channel where it was posted (NULL if private delivery)
- `created_at` - Timestamp

**kudos_recipients** - Recipients of each kudos (supports multiple)

- `id` - Primary key
- `kudos_id` - Foreign key to kudos
- `recipient_id` - Slack user ID
- `notified` - Whether DM was sent

**settings** - Workspace configuration (JSONB storage)

- `key` - Setting name
- `value` - JSON value

## How It Works

### Flow: Sending a Kudos

1. User types `/kudos` in Slack
2. Bot opens an interactive modal with:
   - Multi-select for recipients
   - Text field for message
   - Category dropdown
   - Delivery mode (post to channel or private DM only)
   - Channel selector (optional, only needed for channel delivery)
   - GIF search (Giphy integration)
   - Custom image URL field
3. User fills the form and submits
4. Backend:
   - Saves kudos to database
   - If channel delivery: posts formatted message to selected channel + sends DMs
   - If private delivery: sends DMs only (no channel post)
   - Attached image uses GIF if selected, otherwise custom image URL if provided

### Flow: Viewing Stats

1. User types `/kudos-stats [week|month|all]`
2. Backend queries database for top recipients
3. Bot responds with formatted leaderboard

### Flow: Exporting to Sheets

1. User types `/kudos-export [week|month|all]`
2. Backend fetches kudos from database
3. Data is sent to Google Sheets via API
4. Bot responds with link to the spreadsheet

## Configuration

### Environment Variables

```bash
# Slack App Credentials
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kudos

# App Config
PORT=3000
NODE_ENV=development

# Scheduler
LEADERBOARD_CHANNEL_ID=C0123456789

# Giphy
GIPHY_API_KEY=your-giphy-api-key

# Google Sheets Export
GOOGLE_SHEETS_ID=your-spreadsheet-id
GOOGLE_CREDENTIALS_PATH=./google-credentials.json
```

### Required Slack Permissions (OAuth Scopes)

```
chat:write          # Send messages
chat:write.public   # Send to public channels
commands            # Slash commands
im:write            # Send DMs
users:read          # Read user info
channels:read       # Read channel list
groups:read         # Read private channels
```

## Local Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- ngrok (for Slack to reach localhost)

### Steps

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd kudos
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup PostgreSQL**

   ```bash
   createdb kudos
   psql kudos < src/db/migrations/001_initial.sql
   ```

4. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

5. **Create Slack App**

   - Go to https://api.slack.com/apps
   - Create new app from scratch
   - Enable Socket Mode
   - Add OAuth scopes listed above
   - Install to workspace
   - Copy tokens to `.env`

6. **Run the app**
   ```bash
   npm run dev
   ```

## Commands Reference

| Command       | Description                     |
| ------------- | ------------------------------- |
| `npm run dev` | Start with hot reload (nodemon) |
| `npm start`   | Start for production            |

## Dependencies

| Package     | Purpose                |
| ----------- | ---------------------- |
| @slack/bolt | Slack app framework    |
| pg          | PostgreSQL client      |
| dotenv      | Environment variables  |
| googleapis  | Google Sheets API      |
| node-cron   | Scheduled tasks        |
| nodemon     | Development hot reload |
