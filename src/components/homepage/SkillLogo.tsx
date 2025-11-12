import { useState } from 'react';

interface SkillLogoProps {
  name: string;
  logo: string;
  brandColor: string;
  size?: number;
  className?: string;
}

export function SkillLogo({ name, logo, brandColor, size = 32, className = '' }: SkillLogoProps) {
  const [imgError, setImgError] = useState(false);
  const isUrl = /^https?:\/\//.test(logo);

  // If it's a URL and hasn't errored, render as image
  if (isUrl && !imgError) {
    return (
      <img 
        src={logo} 
        alt={`${name} logo`}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        onError={() => setImgError(true)}
        loading="lazy"
        decoding="async"
      />
    );
  }

  // If it's an emoji (not a URL), render as text
  if (!isUrl) {
    return (
      <span 
        className={className}
        style={{ fontSize: size * 0.75 }}
      >
        {logo}
      </span>
    );
  }

  // Fallback: Show branded initial if image failed to load
  return (
    <div 
      className={`flex items-center justify-center rounded-full font-bold ${className}`}
      style={{ 
        width: size,
        height: size,
        backgroundColor: `${brandColor}20`,
        color: brandColor,
        fontSize: size * 0.5,
        boxShadow: `0 2px 8px ${brandColor}40`
      }}
    >
      {name.charAt(0)}
    </div>
  );
}
