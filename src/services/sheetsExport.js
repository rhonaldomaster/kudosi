const { google } = require('googleapis');
const db = require('../db/connection');

const getAuthClient = () => {
  const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || './google-credentials.json';
  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
};

const getAllKudosForExport = async () => {
  const result = await db.query(`
    SELECT
      k.id,
      k.sender_id,
      k.is_anonymous,
      k.message,
      c.name as category_name,
      c.emoji as category_emoji,
      k.channel_id,
      k.created_at,
      array_agg(kr.recipient_id) as recipients
    FROM kudos k
    LEFT JOIN categories c ON k.category_id = c.id
    LEFT JOIN kudos_recipients kr ON k.id = kr.kudos_id
    GROUP BY k.id, c.name, c.emoji
    ORDER BY k.created_at DESC
  `);
  return result.rows;
};

const exportToSheets = async (slackClient) => {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEETS_ID not configured');
  }

  const auth = getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  // Get all kudos from database
  const kudos = await getAllKudosForExport();

  // Prepare header row
  const headers = [
    'ID',
    'Date',
    'Sender',
    'Recipients',
    'Message',
    'Category',
    'Channel',
    'Anonymous',
  ];

  // Prepare data rows
  const rows = await Promise.all(kudos.map(async (k) => {
    // Get user names from Slack
    let senderName = 'Anonymous';
    if (!k.is_anonymous && k.sender_id) {
      try {
        const senderInfo = await slackClient.users.info({ user: k.sender_id });
        senderName = senderInfo.user?.real_name || senderInfo.user?.name || k.sender_id;
      } catch (e) {
        senderName = k.sender_id;
      }
    }

    let recipientNames = [];
    if (k.recipients && k.recipients[0]) {
      for (const recipientId of k.recipients) {
        try {
          const recipientInfo = await slackClient.users.info({ user: recipientId });
          recipientNames.push(recipientInfo.user?.real_name || recipientInfo.user?.name || recipientId);
        } catch (e) {
          recipientNames.push(recipientId);
        }
      }
    }

    // Get channel name from Slack
    let channelName = k.channel_id;
    try {
      const channelInfo = await slackClient.conversations.info({ channel: k.channel_id });
      channelName = `#${channelInfo.channel?.name || k.channel_id}`;
    } catch (e) {
      channelName = k.channel_id;
    }

    return [
      k.id,
      new Date(k.created_at).toISOString(),
      senderName,
      recipientNames.join(', '),
      k.message,
      k.category_emoji ? `${k.category_emoji} ${k.category_name}` : k.category_name || '',
      channelName,
      k.is_anonymous ? 'Yes' : 'No',
    ];
  }));

  // Clear existing data and write new data
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: 'Sheet1',
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Sheet1!A1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [headers, ...rows],
    },
  });

  return {
    rowCount: rows.length,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  };
};

module.exports = { exportToSheets };
