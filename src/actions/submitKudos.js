const { createKudos, addKudosRecipients, markRecipientsNotified } = require('../db/queries');
const { getLocale, t } = require('../services/i18n');

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
      const delivery = values.delivery_block?.delivery?.selected_option?.value || 'channel';
      const channelId = process.env.GENERAL_CHANNEL_ID || null;
      const categoryId = parseInt(category.value) || null;

      // Resolve selected GIF URL from private_metadata
      let selectedGif = null;
      const gifId = values.gif_selection_block?.gif_selection?.selected_option?.value || null;
      if (gifId && view.private_metadata) {
        try {
          const metadata = JSON.parse(view.private_metadata);
          selectedGif = metadata.gifMap?.[gifId] || null;
        } catch (e) {
          // Ignore parse errors
        }
      }

      const finalImage = selectedGif || null;

      // Format recipients as mentions
      const recipientMentions = recipients.map(id => `<@${id}>`).join(', ');
      const fromText = (locale) => t('kudos.from', locale);

      // Build the kudos message (channel uses English as default for mixed-language workspaces)
      const kudosBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Hey ${recipientMentions}! *KUDOS* - You are being recognized by <@${senderId}>, who wants to tell you: ${message}`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `${category.text.text}`,
            },
          ],
        },
      ];

      // Add image block if available (GIF or custom URL)
      if (finalImage) {
        kudosBlocks.push({
          type: 'image',
          image_url: finalImage,
          alt_text: 'Kudos image',
        });
      }

      // Post kudos to #general (only if delivery mode is 'channel')
      if (delivery === 'channel') {
        if (!channelId) {
          await client.chat.postMessage({
            channel: senderId,
            text: 'Your kudos could not be posted because GENERAL_CHANNEL_ID is not configured.',
          });
          return;
        }

        await client.chat.postMessage({
          channel: channelId,
          text: `Hey ${recipientMentions}! KUDOS - You are being recognized by <@${senderId}>, who wants to tell you: ${message}`,
          blocks: kudosBlocks,
        });
      }

      // Send DM to each recipient (in their language)
      for (const recipientId of recipients) {
        // Don't DM yourself if you're giving kudos to yourself
        if (recipientId === senderId) continue;

        try {
          // Get recipient's locale for personalized DM
          const recipientLocale = await getLocale(recipientId, client);

          const dmBlocks = [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `:tada: *${t('kudos.receivedTitle', recipientLocale)}*`,
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
                  text: `${category.text.text} | ${fromText(recipientLocale)}: <@${senderId}>`,
                },
              ],
            },
          ];

          // Add image block if available (GIF or custom URL)
          if (finalImage) {
            dmBlocks.push({
              type: 'image',
              image_url: finalImage,
              alt_text: 'Kudos image',
            });
          }

          await client.chat.postMessage({
            channel: recipientId,
            text: t('kudos.receivedTitle', recipientLocale),
            blocks: dmBlocks,
          });
        } catch (dmError) {
          console.error(`Error sending DM to ${recipientId}:`, dmError);
        }
      }

      // Save to database
      const kudos = await createKudos({
        senderId,
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
