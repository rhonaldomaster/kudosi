const { exportToSheets } = require('../services/sheetsExport');
const { getLocale, t } = require('../services/i18n');

const registerKudosExportCommand = (app) => {
  app.command('/kudos-export', async ({ ack, body, client }) => {
    await ack();

    const locale = await getLocale(body.user_id, client);

    try {
      // Send initial message
      await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: t('export.exporting', locale),
      });

      const result = await exportToSheets(client);

      await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: t('export.success', locale),
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${t('export.success', locale)}\n\n${t('export.count', locale, { count: result.rowCount })}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `<${result.spreadsheetUrl}|${t('export.openSheet', locale)}>`,
            },
          },
        ],
      });

    } catch (error) {
      console.error('Error exporting kudos:', error);

      await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: t('export.error', locale, { error: error.message }),
      });
    }
  });
};

module.exports = { registerKudosExportCommand };
