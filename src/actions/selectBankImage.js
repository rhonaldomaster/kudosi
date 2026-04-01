const { buildKudosModal } = require('../views/kudosModal');
const { getActiveCategories, getActiveImages } = require('../db/queries');
const { getLocale } = require('../services/i18n');

const registerSelectBankImage = (app) => {
  app.action('image_bank_selection', async ({ ack, body, client }) => {
    await ack();

    try {
      const view = body.view;
      const values = view.state.values;
      const userId = body.user.id;

      // Extract current form values to preserve state during views.update
      const currentValues = {
        recipients: values.recipients_block?.recipients?.selected_users || [],
        message: values.message_block?.message?.value || '',
        category: values.category_block?.category?.selected_option?.value || null,
        delivery: values.delivery_block?.delivery?.selected_option?.value || 'channel',
        channel: values.channel_block?.channel?.selected_conversation || null,
        gifQuery: values.gif_search_block?.gif_search_input?.value || '',
        selectedGif: values.gif_selection_block?.gif_selection?.selected_option?.value || null,
        imageUrl: values.image_url_block?.image_url?.value || '',
        selectedBankImage: values.image_bank_block?.image_bank_selection?.selected_option?.value || null,
      };

      // Restore GIF results from private_metadata
      let gifResults = [];
      if (view.private_metadata) {
        try {
          const metadata = JSON.parse(view.private_metadata);
          if (metadata.gifMap) {
            gifResults = Object.entries(metadata.gifMap).map(([id, url]) => ({
              id,
              title: `GIF`,
              previewUrl: url,
              originalUrl: url,
            }));
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      const [categories, locale, bankImages] = await Promise.all([
        getActiveCategories(),
        getLocale(userId, client),
        getActiveImages(),
      ]);

      const gifEnabled = !!process.env.GIPHY_API_KEY;
      const updatedModal = buildKudosModal(categories, locale, currentValues, gifResults, bankImages, gifEnabled);

      await client.views.update({
        view_id: view.id,
        hash: view.hash,
        view: updatedModal,
      });
    } catch (error) {
      console.error('Error updating image bank preview:', error);
    }
  });
};

module.exports = { registerSelectBankImage };
