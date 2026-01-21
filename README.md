# Kudos Slack App

A Slack application for employee recognition (kudos) at Koombea. Allows team members to recognize colleagues through an interactive modal experience with support for anonymous recognition, leaderboards, and Google Sheets export.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Slack Bolt
- **Database:** PostgreSQL
- **Hosting:** Railway
- **Localization:** i18next (English & Spanish)
- **Scheduling:** node-cron

## Features

- **Give Kudos** - Send recognition to one or multiple colleagues
- **Anonymous Mode** - Option to send kudos anonymously
- **Categories** - 5 predefined categories (Teamwork, Innovation, Helping Hand, Leadership, Going Extra Mile)
- **Channel Selection** - Choose where to post the kudos
- **DM Notifications** - Recipients receive individual notifications
- **Leaderboard** - View top kudos recipients by week, month, or all-time
- **Monthly Reports** - Automatic leaderboard posts on the 1st of each month
- **Google Sheets Export** - Export all kudos history to a spreadsheet
- **Multi-language** - Supports English and Spanish based on user's Slack preferences

## Project Structure

```
src/
├── app.js                    # Entry point
├── commands/
│   ├── kudos.js              # /kudos command handler
│   ├── kudosStats.js         # /kudos-stats command handler
│   └── kudosExport.js        # /kudos-export command handler
├── views/
│   └── kudosModal.js         # Block Kit modal builder
├── actions/
│   └── submitKudos.js        # Modal submission handler
├── services/
│   ├── i18n.js               # Internationalization setup
│   └── sheetsExport.js       # Google Sheets integration
├── db/
│   ├── connection.js         # PostgreSQL connection pool
│   ├── queries.js            # Database queries
│   └── migrations/
│       └── 001_initial.sql   # Database schema
├── scheduler/
│   └── leaderboardJob.js     # Monthly cron job
└── locales/
    ├── en.json               # English translations
    └── es.json               # Spanish translations
```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/kudos` | Opens a modal to send kudos to colleagues |
| `/kudos-stats [week\|month\|all]` | Shows the leaderboard for the specified period |
| `/kudos-export` | Exports all kudos to Google Sheets |

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd kudos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the required environment variables (see below)

4. Run database migrations:
   ```bash
   psql $DATABASE_URL -f src/db/migrations/001_initial.sql
   ```

5. Start the application:
   ```bash
   npm run dev   # Development (with hot-reload)
   npm start     # Production
   ```

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `SLACK_BOT_TOKEN` | Slack app bot token (xoxb-...) |
| `SLACK_SIGNING_SECRET` | Slack app signing secret |
| `SLACK_APP_TOKEN` | Slack app-level token for Socket Mode (xapp-...) |
| `DATABASE_URL` | PostgreSQL connection string |

### Optional

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `LEADERBOARD_CHANNEL_ID` | Channel ID for monthly leaderboard posts |
| `GOOGLE_SHEETS_ID` | Google Spreadsheet ID for exports |
| `GOOGLE_CREDENTIALS_PATH` | Path to Google Service Account JSON |

## Slack App Configuration

### Required OAuth Scopes

- `chat:write` - Post messages
- `chat:write.public` - Post to public channels
- `commands` - Handle slash commands
- `im:write` - Send direct messages
- `users:read` - Get user information
- `users.profile:read` - Detect user language
- `channels:read` - List public channels
- `groups:read` - List private channels

### Socket Mode

This app uses Socket Mode, so no public URL or webhook is required.

## Database Schema

The app uses 4 tables:

- **categories** - Kudos categories with emojis
- **kudos** - Individual kudos records
- **kudos_recipients** - Recipients for each kudos (many-to-one)
- **settings** - Workspace configuration

## License

Proprietary - Koombea
