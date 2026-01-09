const { exportToSheets } = require('../services/sheetsExport');

const registerKudosExportCommand = (app) => {
  app.command('/kudos-export', async ({ ack, body, client }) => {
    await ack();

    try {
      // Send initial message
      await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: ':hourglass_flowing_sand: Exporting kudos to Google Sheets...',
      });

      const result = await exportToSheets(client);

      await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: `:white_check_mark: Export complete!`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:white_check_mark: *Export complete!*\n\nExported *${result.rowCount}* kudos to Google Sheets.`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `<${result.spreadsheetUrl}|:link: Open Google Sheet>`,
            },
          },
        ],
      });

    } catch (error) {
      console.error('Error exporting kudos:', error);

      await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: `:x: Error exporting kudos: ${error.message}`,
      });
    }
  });
};

module.exports = { registerKudosExportCommand };
