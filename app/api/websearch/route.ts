import { NextResponse } from 'next/server';
import {
  doWebSearch,
  doFetchImages,
  doFetchVideos,
} from '@/lib/utils/websearch';

function formatMarkdown({
  results,
  images,
  videos,
}: { results: any[]; images: any[]; videos: any[] }) {
  let md = '';
  if (results?.length) {
    md += '### Результаты поиска\n';
    results.forEach((r, i) => {
      md += `${i + 1}. [${r.title}](${r.url}) — ${r.snippet}\n`;
    });
    md += '\n';
  }
  if (images?.length) {
    md += '### Изображения\n';
    images.forEach((img) => {
      md += `![${img.alt || 'image'}](${img.url}) `;
    });
    md += '\n';
  }
  if (videos?.length) {
    md += '### Видео\n';
    videos.forEach((v) => {
      // Вставляем YouTube embed если ссылка на YouTube
      if (v.url.includes('youtube.com/watch')) {
        const id = v.url.split('v=')[1]?.split('&')[0];
        if (id) {
          md += `<iframe width="360" height="202" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>\n`;
        } else {
          md += `[${v.title}](${v.url})\n`;
        }
      } else {
        md += `[${v.title}](${v.url})\n`;
      }
    });
    md += '\n';
  }
  if (results?.length) {
    md += '\n---\n**Ссылки:**\n';
    results.forEach((r, i) => {
      md += `[${i + 1}] ${r.url}\n`;
    });
  }
  return md;
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 });
    }

    // Параметры можно сделать настраиваемыми
    const [results, images, videos] = await Promise.all([
      doWebSearch(query),
      doFetchImages(query, 4),
      doFetchVideos(query, 2),
    ]);

    const formatted = formatMarkdown({ results, images, videos });

    return NextResponse.json({ results, images, videos, formatted });
  } catch (e) {
    return NextResponse.json(
      { error: 'Internal error', details: String(e) },
      { status: 500 },
    );
  }
}
