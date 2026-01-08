require('dotenv').config();
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// Slash command placeholder
app.command('/kudos', async ({ ack, body, client }) => {
  await ack();
  // TODO: Open modal
});

(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`Kudos app is running on port ${port}`);
})();
