const { buildKudosModal } = require('../views/kudosModal');
const { getActiveCategories, getActiveImages } = require('../db/queries');
const { getLocale } = require('../services/i18n');

const registerKudosCommand = (app) => {
  app.command('/kudos', async ({ ack, body, client }) => {
    await ack();

    try {
      // Fetch categories from database and user locale
      const [categories, locale, bankImages] = await Promise.all([
        getActiveCategories(),
        getLocale(body.user_id, client),
        getActiveImages(),
      ]);

      const gifEnabled = !!process.env.GIPHY_API_KEY;

      await client.views.open({
        trigger_id: body.trigger_id,
        view: buildKudosModal(categories, locale, {}, [], bankImages, gifEnabled),
      });
    } catch (error) {
      console.error('Error opening kudos modal:', error);
    }
  });
};

module.exports = { registerKudosCommand };
