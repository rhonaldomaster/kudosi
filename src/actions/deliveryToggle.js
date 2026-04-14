const { buildKudosModal } = require('../views/kudosModal');
const { getActiveCategories, getActiveImages } = require('../db/queries');

const registerDeliveryToggle = (app) => {
  app.action('delivery', async ({ ack, body, client }) => {
    await ack();

    try {
      const view = body.view;
      const values = view.state.values;
      const selectedDelivery = values.delivery_block?.delivery?.selected_option?.value || 'channel';
      const showChannelBlock = selectedDelivery === 'channel';

      // Preserve current form values
      const currentValues = {
        recipients: values.recipients_block?.recipients?.selected_users || [],
        message: values.message_block?.message?.value || '',
        category: values.category_block?.category?.selected_option?.value || null,
        delivery: selectedDelivery,
        channel: values.channel_block?.channel?.selected_conversation || null,
        imageUrl: values.image_url_block?.image_url?.value || null,
      };

      const [categories, bankImages] = await Promise.all([
        getActiveCategories(),
        getActiveImages(),
      ]);

      const gifEnabled = !!process.env.GIPHY_API_KEY;

      // Restore private_metadata (gif/image bank maps)
      let existingMetadata = {};
      try {
        existingMetadata = JSON.parse(view.private_metadata || '{}');
      } catch (e) {
        // Ignore parse errors
      }

      const updatedView = buildKudosModal(categories, 'en', currentValues, [], bankImages, gifEnabled, showChannelBlock);

      // Preserve existing gif/image bank metadata
      if (Object.keys(existingMetadata).length > 0) {
        updatedView.private_metadata = JSON.stringify(existingMetadata);
      }

      await client.views.update({
        view_id: view.id,
        hash: view.hash,
        view: updatedView,
      });
    } catch (error) {
      console.error('Error toggling delivery mode:', error);
    }
  });
};

module.exports = { registerDeliveryToggle };
