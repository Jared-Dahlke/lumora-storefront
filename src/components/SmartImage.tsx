import { useState } from 'react';
import { gradientFor } from '../utils';

interface Props {
  src?: string;
  alt: string;
  name: string;
  className?: string;
}

/** Image that swaps to an on-brand gradient placeholder if the remote URL fails. */
export default function SmartImage({ src, alt, name, className }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`smart-image fallback ${className ?? ''}`}
        style={{ background: gradientFor(name) }}
        role="img"
        aria-label={alt}
      >
        <span className="fallback-label">{name}</span>
      </div>
    );
  }
  return (
    <img
      className={`smart-image ${className ?? ''}`}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
