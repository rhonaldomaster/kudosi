const cron = require('node-cron');
const { getLeaderboard } = require('../db/queries');

const startLeaderboardScheduler = (client) => {
  const channelId = process.env.LEADERBOARD_CHANNEL_ID;

  if (!channelId) {
    console.log('LEADERBOARD_CHANNEL_ID not set, scheduler disabled');
    return;
  }

  // Run on the first day of every month at 9:00 AM
  // Cron format: minute hour day-of-month month day-of-week
  cron.schedule('0 9 1 * *', async () => {
    console.log('Running monthly leaderboard job...');

    try {
      // Get last month's leaderboard
      const since = new Date();
      since.setMonth(since.getMonth() - 1);

      const leaderboard = await getLeaderboard(10, since);

      if (leaderboard.length === 0) {
        console.log('No kudos last month, skipping post');
        return;
      }

      // Build leaderboard message
      const leaderboardLines = leaderboard.map((entry, index) => {
        const medal = index === 0 ? ':first_place_medal:' : index === 1 ? ':second_place_medal:' : index === 2 ? ':third_place_medal:' : `${index + 1}.`;
        return `${medal} <@${entry.recipient_id}> - *${entry.kudos_count}* kudos`;
      });

      const monthName = new Date(since).toLocaleString('en-US', { month: 'long' });

      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Kudos Leaderboard - ${monthName}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:tada: *Congratulations to our top kudos recipients last month!* :tada:`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: leaderboardLines.join('\n'),
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: 'Give kudos with `/kudos` | View stats with `/kudos-stats`',
            },
          ],
        },
      ];

      await client.chat.postMessage({
        channel: channelId,
        text: `Kudos Leaderboard - ${monthName}`,
        blocks,
      });

      console.log('Monthly leaderboard posted successfully');

    } catch (error) {
      console.error('Error posting monthly leaderboard:', error);
    }
  });

  console.log('Leaderboard scheduler started (monthly on the 1st at 9:00 AM)');
};

module.exports = { startLeaderboardScheduler };
