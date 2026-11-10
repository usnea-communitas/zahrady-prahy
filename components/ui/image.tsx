// An <img> with the next/image props the atlas used. The illustrations are
// pre-sized WebP files, so nothing is resized at request time.
import type { ComponentPropsWithRef } from 'react';

type Props = Omit<ComponentPropsWithRef<'img'>, 'src' | 'alt'> & {
  src: string;
  alt: string;
  /** Fill the positioned parent, like next/image's `fill`. */
  fill?: boolean;
  /** Load at once and with high priority (the first, largest image). */
  priority?: boolean;
};

export default function Image({
  src,
  alt,
  fill,
  priority,
  style,
  loading,
  fetchPriority,
  ...rest
}: Props) {
  return (
    <img
      src={src}
      alt={alt}
      style={
        fill
          ? {
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              ...style,
            }
          : style
      }
      loading={priority ? 'eager' : (loading ?? 'lazy')}
      fetchPriority={priority ? 'high' : fetchPriority}
      decoding="async"
      {...rest}
    />
  );
}
