// The atlas used next/image only as a plain <img> (images: { unoptimized: true }).
import type { CSSProperties } from 'react';

type Props = {
  src: string | { src: string };
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
  draggable?: boolean;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  onLoad?: () => void;
};

export default function Image({ src, alt, fill, priority, style, loading, fetchPriority, ...rest }: Props) {
  const url = typeof src === 'string' ? src : src.src;
  const fillStyle: CSSProperties | undefined = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }
    : style;
  return (
    <img
      src={url}
      alt={alt}
      style={fillStyle}
      loading={priority ? 'eager' : (loading ?? 'lazy')}
      fetchPriority={priority ? 'high' : fetchPriority}
      decoding="async"
      {...rest}
    />
  );
}
