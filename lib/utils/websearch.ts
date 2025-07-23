import type { NextApiRequest } from 'next';

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface ImageResult {
  url: string;
  alt: string;
}

export interface VideoResult {
  url: string;
  title: string;
  thumbnail: string;
}

// Реальный вызов Serper API
export async function doWebSearch(query: string): Promise<WebSearchResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error('SERPER_API_KEY not set');
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query }),
  });
  if (!res.ok) throw new Error('Serper API error');
  const data = await res.json();
  // Форматируем для UI
  const results: WebSearchResult[] = [];
  if (Array.isArray(data.organic)) {
    for (const item of data.organic) {
      results.push({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
      });
    }
  }
  return results;
}

// Реальный вызов Unsplash API
export async function doFetchImages(
  query: string,
  count: number,
): Promise<ImageResult[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) throw new Error('UNSPLASH_ACCESS_KEY not set');
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    },
  );
  if (!res.ok) throw new Error('Unsplash API error');
  const data = await res.json();
  if (!Array.isArray(data.results)) return [];
  return data.results.map((img: any) => ({
    url: img.urls?.regular || img.urls?.small || img.urls?.thumb,
    alt: img.alt_description || img.description || 'image',
  }));
}

// Реальный вызов YouTube Data API
export async function doFetchVideos(
  query: string,
  maxResults: number,
): Promise<VideoResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY not set');
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('YouTube API error');
  const data = await res.json();
  if (!Array.isArray(data.items)) return [];
  return data.items.map((item: any) => ({
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.medium?.url || '',
  }));
}
