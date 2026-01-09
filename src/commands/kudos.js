const { buildKudosModal } = require('../views/kudosModal');
const { getActiveCategories } = require('../db/queries');

const registerKudosCommand = (app) => {
  app.command('/kudos', async ({ ack, body, client }) => {
    await ack();

    try {
      // Fetch categories from database
      const categories = await getActiveCategories();

      await client.views.open({
        trigger_id: body.trigger_id,
        view: buildKudosModal(categories),
      });
    } catch (error) {
      console.error('Error opening kudos modal:', error);
    }
  });
};

module.exports = { registerKudosCommand };
