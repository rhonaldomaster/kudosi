const buildKudosModal = (categories = []) => {
  return {
    type: 'modal',
    callback_id: 'kudos_modal_submit',
    title: {
      type: 'plain_text',
      text: 'Give Kudos',
    },
    submit: {
      type: 'plain_text',
      text: 'Send Kudos',
    },
    close: {
      type: 'plain_text',
      text: 'Cancel',
    },
    blocks: [
      {
        type: 'input',
        block_id: 'recipients_block',
        label: {
          type: 'plain_text',
          text: 'Who deserves kudos?',
        },
        element: {
          type: 'multi_users_select',
          action_id: 'recipients',
          placeholder: {
            type: 'plain_text',
            text: 'Select people',
          },
        },
      },
      {
        type: 'input',
        block_id: 'message_block',
        label: {
          type: 'plain_text',
          text: 'Why are you giving kudos?',
        },
        element: {
          type: 'plain_text_input',
          action_id: 'message',
          multiline: true,
          placeholder: {
            type: 'plain_text',
            text: 'Share what they did and why it matters...',
          },
        },
      },
      {
        type: 'input',
        block_id: 'category_block',
        label: {
          type: 'plain_text',
          text: 'Category',
        },
        element: {
          type: 'static_select',
          action_id: 'category',
          placeholder: {
            type: 'plain_text',
            text: 'Select a category',
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
          text: 'Post to channel',
        },
        element: {
          type: 'conversations_select',
          action_id: 'channel',
          placeholder: {
            type: 'plain_text',
            text: 'Select a channel',
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
          text: 'Send anonymously?',
        },
        optional: true,
        element: {
          type: 'checkboxes',
          action_id: 'anonymous',
          options: [
            {
              text: {
                type: 'plain_text',
                text: 'Yes, send this kudos anonymously',
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
