interface CourseHeroImageProps {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

export function CourseHeroImage({ src, alt, title, subtitle }: CourseHeroImageProps) {
  return (
    <div className="relative h-56 overflow-hidden rounded-t-lg">
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      {title && (
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-kanit font-bold text-white mb-1 line-clamp-1">{title}</h3>
          {subtitle && (
            <p className="text-xs text-white/80 line-clamp-1">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}
