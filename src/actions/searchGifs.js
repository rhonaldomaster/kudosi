const { searchGifs } = require('../services/giphy');
const { buildKudosModal } = require('../views/kudosModal');
const { getActiveCategories } = require('../db/queries');
const { getLocale } = require('../services/i18n');

const registerSearchGifs = (app) => {
  app.action('search_gifs_button', async ({ ack, body, client }) => {
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
        channel: values.channel_block?.channel?.selected_conversation || null,
        gifQuery: values.gif_search_block?.gif_search_input?.value || '',
        selectedGif: values.gif_selection_block?.gif_selection?.selected_option?.value || null, // GIF ID
      };

      const query = currentValues.gifQuery;

      if (!query) {
        return;
      }

      // Fetch categories and locale
      const [categories, locale] = await Promise.all([
        getActiveCategories(),
        getLocale(userId, client),
      ]);

      // Search GIFs
      const gifResults = await searchGifs(query);

      // Update modal with GIF results
      const updatedModal = buildKudosModal(categories, locale, currentValues, gifResults);

      await client.views.update({
        view_id: view.id,
        hash: view.hash,
        view: updatedModal,
      });
    } catch (error) {
      console.error('Error searching GIFs:', error);
      if (error.data?.response_metadata?.messages) {
        console.error('Slack validation errors:', JSON.stringify(error.data.response_metadata.messages, null, 2));
      }
    }
  });
};

module.exports = { registerSearchGifs };
