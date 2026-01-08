require('dotenv').config();
const { App } = require('@slack/bolt');
const { registerKudosCommand } = require('./commands/kudos');
const { registerSubmitKudos } = require('./actions/submitKudos');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// Register commands
registerKudosCommand(app);

// Register actions
registerSubmitKudos(app);

(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`Kudos app is running on port ${port}`);
})();
