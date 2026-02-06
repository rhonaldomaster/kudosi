const { t } = require('../services/i18n');

const buildKudosModal = (categories = [], locale = 'en', currentValues = {}, gifResults = []) => {
  // Recipients block
  const recipientsElement = {
    type: 'multi_users_select',
    action_id: 'recipients',
    placeholder: {
      type: 'plain_text',
      text: t('modal.recipientPlaceholder', locale),
    },
  };
  if (currentValues.recipients?.length) {
    recipientsElement.initial_users = currentValues.recipients;
  }

  // Message block
  const messageElement = {
    type: 'plain_text_input',
    action_id: 'message',
    multiline: true,
    placeholder: {
      type: 'plain_text',
      text: t('modal.messagePlaceholder', locale),
    },
  };
  if (currentValues.message) {
    messageElement.initial_value = currentValues.message;
  }

  // Category block
  const categoryOptions = categories.length > 0
    ? categories.map(cat => ({
        text: {
          type: 'plain_text',
          text: `${cat.emoji} ${cat.name}`,
        },
        value: String(cat.id),
      }))
    : [
        { text: { type: 'plain_text', text: 'Teamwork' }, value: 'teamwork' },
        { text: { type: 'plain_text', text: 'Innovation' }, value: 'innovation' },
        { text: { type: 'plain_text', text: 'Helping Hand' }, value: 'helping' },
        { text: { type: 'plain_text', text: 'Leadership' }, value: 'leadership' },
        { text: { type: 'plain_text', text: 'Going Extra Mile' }, value: 'extra' },
      ];

  const categoryElement = {
    type: 'static_select',
    action_id: 'category',
    placeholder: {
      type: 'plain_text',
      text: t('modal.categoryPlaceholder', locale),
    },
    options: categoryOptions,
  };
  if (currentValues.category) {
    const initialOption = categoryOptions.find(o => o.value === currentValues.category);
    if (initialOption) {
      categoryElement.initial_option = initialOption;
    }
  }

  // Channel block
  const channelElement = {
    type: 'conversations_select',
    action_id: 'channel',
    placeholder: {
      type: 'plain_text',
      text: t('modal.channelPlaceholder', locale),
    },
    filter: {
      include: ['public', 'private'],
      exclude_bot_users: true,
    },
  };
  if (currentValues.channel) {
    channelElement.initial_conversation = currentValues.channel;
  } else {
    channelElement.default_to_current_conversation = true;
  }

  // GIF search input
  const gifSearchElement = {
    type: 'plain_text_input',
    action_id: 'gif_search_input',
    placeholder: {
      type: 'plain_text',
      text: t('modal.gifSearchPlaceholder', locale),
    },
  };
  if (currentValues.gifQuery) {
    gifSearchElement.initial_value = currentValues.gifQuery;
  }

  // Base blocks
  const blocks = [
    {
      type: 'input',
      block_id: 'recipients_block',
      label: {
        type: 'plain_text',
        text: t('modal.recipientLabel', locale),
      },
      element: recipientsElement,
    },
    {
      type: 'input',
      block_id: 'message_block',
      label: {
        type: 'plain_text',
        text: t('modal.messageLabel', locale),
      },
      element: messageElement,
    },
    {
      type: 'input',
      block_id: 'category_block',
      label: {
        type: 'plain_text',
        text: t('modal.categoryLabel', locale),
      },
      element: categoryElement,
    },
    {
      type: 'input',
      block_id: 'channel_block',
      label: {
        type: 'plain_text',
        text: t('modal.channelLabel', locale),
      },
      element: channelElement,
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: t('modal.gifSectionTitle', locale),
      },
    },
    {
      type: 'input',
      block_id: 'gif_search_block',
      optional: true,
      label: {
        type: 'plain_text',
        text: t('modal.gifSearchLabel', locale),
      },
      element: gifSearchElement,
      dispatch_action: false,
    },
    {
      type: 'actions',
      block_id: 'gif_actions_block',
      elements: [
        {
          type: 'button',
          action_id: 'search_gifs_button',
          text: {
            type: 'plain_text',
            text: t('modal.gifSearchButton', locale),
          },
        },
      ],
    },
  ];

  // Build private_metadata with GIF URL mapping
  const gifMap = {};
  for (const gif of gifResults) {
    gifMap[gif.id] = gif.originalUrl;
  }

  // Add GIF results if present
  if (gifResults.length > 0) {
    const gifOptions = gifResults.map((gif, index) => ({
      text: {
        type: 'plain_text',
        text: gif.title || `GIF ${index + 1}`,
      },
      value: gif.id,
    }));

    const gifSelectionElement = {
      type: 'radio_buttons',
      action_id: 'gif_selection',
      options: gifOptions,
    };

    if (currentValues.selectedGif) {
      const selectedOption = gifOptions.find(o => o.value === currentValues.selectedGif);
      if (selectedOption) {
        gifSelectionElement.initial_option = selectedOption;
      }
    }

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: t('modal.gifResultsTitle', locale),
      },
    });

    blocks.push({
      type: 'input',
      block_id: 'gif_selection_block',
      optional: true,
      label: {
        type: 'plain_text',
        text: t('modal.gifSelectionLabel', locale),
      },
      element: gifSelectionElement,
    });

    // Add image previews
    for (const gif of gifResults) {
      blocks.push({
        type: 'image',
        image_url: gif.previewUrl,
        alt_text: gif.title || 'GIF preview',
      });
    }
  }

  const modal = {
    type: 'modal',
    callback_id: 'kudos_modal_submit',
    title: {
      type: 'plain_text',
      text: t('modal.title', locale),
    },
    submit: {
      type: 'plain_text',
      text: t('modal.submit', locale),
    },
    close: {
      type: 'plain_text',
      text: t('modal.cancel', locale),
    },
    blocks,
  };

  if (Object.keys(gifMap).length > 0) {
    modal.private_metadata = JSON.stringify({ gifMap });
  }

  return modal;
};

module.exports = { buildKudosModal };
