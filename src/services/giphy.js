const searchGifs = async (query, limit = 5) => {
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) {
    throw new Error('GIPHY_API_KEY not configured');
  }

  const url = new URL('https://api.giphy.com/v1/gifs/search');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('rating', 'g');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Giphy API error: ${response.status}`);
  }

  const data = await response.json();

  return data.data.map(gif => ({
    id: gif.id,
    title: gif.title || 'GIF',
    previewUrl: gif.images.fixed_height.url,
    originalUrl: gif.images.original.url,
  }));
};

module.exports = { searchGifs };
