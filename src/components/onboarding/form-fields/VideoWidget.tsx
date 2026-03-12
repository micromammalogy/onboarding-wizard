'use client';

import type { ITemplateWidget } from '@/types/database';
import styles from './VideoWidget.module.scss';

type IVideoWidgetProps = {
  widget: ITemplateWidget;
};

function getEmbedUrl(meta: { url?: string; service?: string; serviceCode?: string }): string | null {
  if (!meta.url && !meta.serviceCode) return null;

  // Loom videos
  if (meta.service === 'loom' && meta.serviceCode) {
    return `https://www.loom.com/embed/${meta.serviceCode}`;
  }
  // YouTube
  if (meta.service === 'youtube' && meta.serviceCode) {
    return `https://www.youtube.com/embed/${meta.serviceCode}`;
  }
  // Vimeo
  if (meta.service === 'vimeo' && meta.serviceCode) {
    return `https://player.vimeo.com/video/${meta.serviceCode}`;
  }
  // Direct URL fallback
  if (meta.url) {
    // Convert loom share links to embed
    const loomMatch = meta.url.match(/loom\.com\/share\/([a-f0-9]+)/);
    if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;
    return meta.url;
  }

  return null;
}

export function VideoWidget({ widget }: IVideoWidgetProps) {
  const meta = widget.metadata as { url?: string; service?: string; serviceCode?: string };
  const embedUrl = getEmbedUrl(meta);

  if (!embedUrl) return null;

  return (
    <div className={styles.container}>
      <iframe
        src={embedUrl}
        className={styles.iframe}
        allowFullScreen
        title="Video"
      />
    </div>
  );
}
