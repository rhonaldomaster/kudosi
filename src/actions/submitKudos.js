const { createKudos, addKudosRecipients, markRecipientsNotified } = require('../db/queries');

const registerSubmitKudos = (app) => {
  app.view('kudos_modal_submit', async ({ ack, body, view, client }) => {
    await ack();

    try {
      const values = view.state.values;
      const senderId = body.user.id;

      // Extract form values
      const recipients = values.recipients_block.recipients.selected_users;
      const message = values.message_block.message.value;
      const category = values.category_block.category.selected_option;
      const channelId = values.channel_block.channel.selected_conversation;
      const isAnonymous = values.anonymous_block.anonymous.selected_options?.length > 0;
      const categoryId = parseInt(category.value) || null;

      // Format recipients as mentions
      const recipientMentions = recipients.map(id => `<@${id}>`).join(', ');

      // Build the kudos message
      const kudosBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${recipientMentions}* received kudos! :tada:`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `> ${message}`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `${category.text.text} | From: ${isAnonymous ? '_Anonymous_' : `<@${senderId}>`}`,
            },
          ],
        },
      ];

      // Post kudos to the selected channel
      await client.chat.postMessage({
        channel: channelId,
        text: `${recipientMentions} received kudos!`,
        blocks: kudosBlocks,
      });

      // Send DM to each recipient
      for (const recipientId of recipients) {
        // Don't DM yourself if you're giving kudos to yourself
        if (recipientId === senderId && !isAnonymous) continue;

        try {
          await client.chat.postMessage({
            channel: recipientId,
            text: `You received kudos! :tada:`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `:tada: *You received kudos!*`,
                },
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `> ${message}`,
                },
              },
              {
                type: 'context',
                elements: [
                  {
                    type: 'mrkdwn',
                    text: `${category.text.text} | From: ${isAnonymous ? '_Anonymous_' : `<@${senderId}>`}`,
                  },
                ],
              },
            ],
          });
        } catch (dmError) {
          console.error(`Error sending DM to ${recipientId}:`, dmError);
        }
      }

      // Save to database
      const kudos = await createKudos({
        senderId,
        isAnonymous,
        message,
        categoryId,
        channelId,
      });

      await addKudosRecipients(kudos.id, recipients);
      await markRecipientsNotified(kudos.id);

      console.log(`Kudos ${kudos.id} saved to database`);

    } catch (error) {
      console.error('Error submitting kudos:', error);
    }
  });
};

module.exports = { registerSubmitKudos };
