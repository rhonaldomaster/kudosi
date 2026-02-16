const db = require('./connection');

// Categories
const getActiveCategories = async () => {
  const result = await db.query(
    'SELECT id, name, emoji FROM categories WHERE active = true ORDER BY id'
  );
  return result.rows;
};

// Kudos
const createKudos = async ({ senderId, message, categoryId, channelId }) => {
  const result = await db.query(
    `INSERT INTO kudos (sender_id, is_anonymous, message, category_id, channel_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [senderId, false, message, categoryId, channelId]
  );
  return result.rows[0];
};

// Kudos Recipients
const addKudosRecipients = async (kudosId, recipientIds) => {
  const values = recipientIds.map((id, index) => `($1, $${index + 2})`).join(', ');
  const params = [kudosId, ...recipientIds];

  await db.query(
    `INSERT INTO kudos_recipients (kudos_id, recipient_id) VALUES ${values}`,
    params
  );
};

const markRecipientsNotified = async (kudosId) => {
  await db.query(
    'UPDATE kudos_recipients SET notified = true WHERE kudos_id = $1',
    [kudosId]
  );
};

// Stats
const getKudosReceivedCount = async (userId) => {
  const result = await db.query(
    `SELECT COUNT(*) as count FROM kudos_recipients WHERE recipient_id = $1`,
    [userId]
  );
  return parseInt(result.rows[0].count);
};

const getKudosGivenCount = async (userId) => {
  const result = await db.query(
    `SELECT COUNT(*) as count FROM kudos WHERE sender_id = $1`,
    [userId]
  );
  return parseInt(result.rows[0].count);
};

const getLeaderboard = async (limit = 10, since = null) => {
  let query = `
    SELECT recipient_id, COUNT(*) as kudos_count
    FROM kudos_recipients kr
    JOIN kudos k ON kr.kudos_id = k.id
  `;

  const params = [];
  if (since) {
    query += ' WHERE k.created_at >= $1';
    params.push(since);
  }

  query += `
    GROUP BY recipient_id
    ORDER BY kudos_count DESC
    LIMIT $${params.length + 1}
  `;
  params.push(limit);

  const result = await db.query(query, params);
  return result.rows;
};

module.exports = {
  getActiveCategories,
  createKudos,
  addKudosRecipients,
  markRecipientsNotified,
  getKudosReceivedCount,
  getKudosGivenCount,
  getLeaderboard,
};
