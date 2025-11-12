interface CourseHeroImageProps {
  src: string;
  alt: string;
  title: string;
  subtitle?: string;
}

export function CourseHeroImage({ src, alt, title, subtitle }: CourseHeroImageProps) {
  return (
    <div className="relative h-48 overflow-hidden rounded-t-lg">
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        {subtitle && (
          <p className="text-sm text-white/80">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
