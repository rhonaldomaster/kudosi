const i18next = require('i18next');
const en = require('../locales/en.json');
const es = require('../locales/es.json');

// Initialize i18next
i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    es: { translation: es }
  },
  interpolation: {
    escapeValue: false
  }
});

// Map Slack locales to our supported locales
function mapLocale(slackLocale) {
  if (!slackLocale) return 'en';
  if (slackLocale.startsWith('es')) return 'es';
  if (slackLocale.startsWith('pt')) return 'es'; // Portuguese users might prefer Spanish over English
  return 'en';
}

// Get user locale from Slack API
async function getLocale(userId, client) {
  try {
    const result = await client.users.info({ user: userId });
    const slackLocale = result.user?.locale || 'en';
    return mapLocale(slackLocale);
  } catch (error) {
    console.error('Error getting user locale:', error.message);
    return 'en';
  }
}

// Translate helper function
function t(key, locale = 'en', options = {}) {
  return i18next.t(key, { lng: locale, ...options });
}

// Get all supported locales
function getSupportedLocales() {
  return ['en', 'es'];
}

module.exports = {
  getLocale,
  t,
  i18next,
  mapLocale,
  getSupportedLocales
};
