import { useEffect, useRef, useState, ComponentType } from 'react';

interface LazyInfographicProps {
  component: ComponentType<any>;
  componentProps: any;
  fallback?: React.ReactNode;
}

export function LazyInfographic({ component: Component, componentProps, fallback }: LazyInfographicProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="min-h-[200px]">
      {isVisible ? (
        <Component {...componentProps} />
      ) : (
        fallback || (
          <div className="animate-pulse bg-muted rounded-lg h-[200px]" />
        )
      )}
    </div>
  );
}
