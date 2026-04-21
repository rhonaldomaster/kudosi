const registerDeliveryToggle = (app) => {
  app.action('delivery', async ({ ack }) => {
    await ack();
  });
};

module.exports = { registerDeliveryToggle };
