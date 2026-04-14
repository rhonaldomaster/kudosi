const { t } = require('../services/i18n');

const buildKudosModal = (categories = [], locale = 'en', currentValues = {}, gifResults = [], bankImages = [], gifEnabled = true, showChannelBlock = true) => {
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

  // Delivery mode block
  const deliveryOptions = [
    {
      text: { type: 'plain_text', text: t('modal.deliveryChannel', locale) },
      value: 'channel',
    },
    {
      text: { type: 'plain_text', text: t('modal.deliveryPrivate', locale) },
      value: 'private',
    },
  ];

  const deliveryElement = {
    type: 'radio_buttons',
    action_id: 'delivery',
    options: deliveryOptions,
    initial_option: deliveryOptions.find(o => o.value === (currentValues.delivery || 'channel')),
  };

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
  }

  const channelBlock = {
    type: 'input',
    block_id: 'channel_block',
    optional: true,
    label: {
      type: 'plain_text',
      text: t('modal.channelLabel', locale),
    },
    element: channelElement,
  };

  // Image URL input
  const imageUrlElement = {
    type: 'plain_text_input',
    action_id: 'image_url',
    placeholder: {
      type: 'plain_text',
      text: t('modal.imageUrlPlaceholder', locale),
    },
  };
  if (currentValues.imageUrl) {
    imageUrlElement.initial_value = currentValues.imageUrl;
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
      block_id: 'delivery_block',
      dispatch_action: true,
      label: {
        type: 'plain_text',
        text: t('modal.deliveryLabel', locale),
      },
      element: deliveryElement,
    },
    ...(showChannelBlock ? [channelBlock] : []),
  ];

  // GIF search section (only if Giphy is configured)
  if (gifEnabled) {
    blocks.push(
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
      }
    );
  }

  // Build private_metadata with GIF URL mapping and image bank mapping
  const gifMap = {};
  for (const gif of gifResults) {
    gifMap[gif.id] = gif.originalUrl;
  }

  const imageBankMap = {};
  for (const img of bankImages) {
    imageBankMap[String(img.id)] = img.url;
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

  // Image Bank section
  if (bankImages.length > 0) {
    const bankOptions = bankImages.map(img => ({
      text: {
        type: 'plain_text',
        text: img.title,
      },
      value: String(img.id),
    }));

    const bankElement = {
      type: 'static_select',
      action_id: 'image_bank_selection',
      placeholder: {
        type: 'plain_text',
        text: t('modal.imageBankPlaceholder', locale),
      },
      options: bankOptions,
    };

    if (currentValues.selectedBankImage) {
      const selectedOption = bankOptions.find(o => o.value === currentValues.selectedBankImage);
      if (selectedOption) {
        bankElement.initial_option = selectedOption;
      }
    }

    blocks.push({
      type: 'divider',
    });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: t('modal.imageBankSectionTitle', locale),
      },
    });
    blocks.push({
      type: 'input',
      block_id: 'image_bank_block',
      optional: true,
      dispatch_action: true,
      label: {
        type: 'plain_text',
        text: t('modal.imageBankLabel', locale),
      },
      element: bankElement,
    });

    // Show preview of selected image
    if (currentValues.selectedBankImage) {
      const selectedImg = bankImages.find(img => String(img.id) === currentValues.selectedBankImage);
      if (selectedImg) {
        blocks.push({
          type: 'image',
          image_url: selectedImg.url,
          alt_text: selectedImg.title,
        });
      }
    }
  }

  // Image URL field always at the bottom
  blocks.push({
    type: 'divider',
  });
  blocks.push({
    type: 'input',
    block_id: 'image_url_block',
    optional: true,
    label: {
      type: 'plain_text',
      text: t('modal.imageUrlLabel', locale),
    },
    element: imageUrlElement,
  });

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

  const metadata = {};
  if (Object.keys(gifMap).length > 0) {
    metadata.gifMap = gifMap;
  }
  if (Object.keys(imageBankMap).length > 0) {
    metadata.imageBankMap = imageBankMap;
  }
  if (Object.keys(metadata).length > 0) {
    modal.private_metadata = JSON.stringify(metadata);
  }

  return modal;
};

module.exports = { buildKudosModal };
