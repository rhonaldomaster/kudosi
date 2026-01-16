const { getLeaderboard } = require('../db/queries');
const { getLocale, t } = require('../services/i18n');

const registerKudosStatsCommand = (app) => {
  app.command('/kudos-stats', async ({ ack, body, client, command }) => {
    await ack();

    try {
      const arg = command.text?.trim().toLowerCase() || 'all';
      const locale = await getLocale(body.user_id, client);

      let since = null;
      let periodKey = 'all';

      if (arg === 'week') {
        since = new Date();
        since.setDate(since.getDate() - 7);
        periodKey = 'week';
      } else if (arg === 'month') {
        since = new Date();
        since.setMonth(since.getMonth() - 1);
        periodKey = 'month';
      }

      const periodLabel = t(`leaderboard.periods.${periodKey}`, locale);
      const leaderboard = await getLeaderboard(10, since);

      if (leaderboard.length === 0) {
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: t('leaderboard.empty', locale, { period: periodLabel.toLowerCase() }),
        });
        return;
      }

      // Build leaderboard message
      const leaderboardLines = await Promise.all(
        leaderboard.map(async (entry, index) => {
          const medal = index === 0 ? ':first_place_medal:' : index === 1 ? ':second_place_medal:' : index === 2 ? ':third_place_medal:' : `${index + 1}.`;
          return `${medal} <@${entry.recipient_id}> - *${entry.kudos_count}* kudos`;
        })
      );

      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: t('leaderboard.title', locale, { period: periodLabel }),
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
              text: 'Use `/kudos-stats week`, `/kudos-stats month`, or `/kudos-stats all`',
            },
          ],
        },
      ];

      await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: t('leaderboard.title', locale, { period: periodLabel }),
        blocks,
      });

    } catch (error) {
      console.error('Error showing kudos stats:', error);
    }
  });
};

module.exports = { registerKudosStatsCommand };
