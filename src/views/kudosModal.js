const { t } = require('../services/i18n');

const buildKudosModal = (categories = [], locale = 'en') => {
  return {
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
    blocks: [
      {
        type: 'input',
        block_id: 'recipients_block',
        label: {
          type: 'plain_text',
          text: t('modal.recipientLabel', locale),
        },
        element: {
          type: 'multi_users_select',
          action_id: 'recipients',
          placeholder: {
            type: 'plain_text',
            text: t('modal.recipientPlaceholder', locale),
          },
        },
      },
      {
        type: 'input',
        block_id: 'message_block',
        label: {
          type: 'plain_text',
          text: t('modal.messageLabel', locale),
        },
        element: {
          type: 'plain_text_input',
          action_id: 'message',
          multiline: true,
          placeholder: {
            type: 'plain_text',
            text: t('modal.messagePlaceholder', locale),
          },
        },
      },
      {
        type: 'input',
        block_id: 'category_block',
        label: {
          type: 'plain_text',
          text: t('modal.categoryLabel', locale),
        },
        element: {
          type: 'static_select',
          action_id: 'category',
          placeholder: {
            type: 'plain_text',
            text: t('modal.categoryPlaceholder', locale),
          },
          options: categories.length > 0
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
              ],
        },
      },
      {
        type: 'input',
        block_id: 'channel_block',
        label: {
          type: 'plain_text',
          text: t('modal.channelLabel', locale),
        },
        element: {
          type: 'conversations_select',
          action_id: 'channel',
          placeholder: {
            type: 'plain_text',
            text: t('modal.channelPlaceholder', locale),
          },
          default_to_current_conversation: true,
          filter: {
            include: ['public', 'private'],
            exclude_bot_users: true,
          },
        },
      },
      {
        type: 'input',
        block_id: 'anonymous_block',
        label: {
          type: 'plain_text',
          text: t('modal.anonymousLabel', locale),
        },
        optional: true,
        element: {
          type: 'checkboxes',
          action_id: 'anonymous',
          options: [
            {
              text: {
                type: 'plain_text',
                text: locale === 'es' ? 'Sí, enviar este kudos de forma anónima' : 'Yes, send this kudos anonymously',
              },
              value: 'anonymous',
            },
          ],
        },
      },
    ],
  };
};

module.exports = { buildKudosModal };
