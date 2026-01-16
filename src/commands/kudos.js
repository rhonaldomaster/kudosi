const { buildKudosModal } = require('../views/kudosModal');
const { getActiveCategories } = require('../db/queries');
const { getLocale } = require('../services/i18n');

const registerKudosCommand = (app) => {
  app.command('/kudos', async ({ ack, body, client }) => {
    await ack();

    try {
      // Fetch categories from database and user locale
      const [categories, locale] = await Promise.all([
        getActiveCategories(),
        getLocale(body.user_id, client)
      ]);

      await client.views.open({
        trigger_id: body.trigger_id,
        view: buildKudosModal(categories, locale),
      });
    } catch (error) {
      console.error('Error opening kudos modal:', error);
    }
  });
};

module.exports = { registerKudosCommand };
