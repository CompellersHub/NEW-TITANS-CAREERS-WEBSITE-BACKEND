import { clientCompanies } from '@/data/clientCompanies';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useRef, useMemo } from 'react';

export function CompanyLogosCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const autoplayPlugin = useMemo(() => Autoplay({
    delay: 1500,
    stopOnInteraction: false,
    stopOnMouseEnter: false,
  }), []);

  // Duplicate companies for seamless infinite scroll
  const duplicatedCompanies = useMemo(() => [...clientCompanies, ...clientCompanies], []);

  useEffect(() => {
    if (!carouselRef.current) return;

    const validateLogo = (imgEl: HTMLImageElement, brandName: string) => {
      const remove = (reason: string) => {
        const slide = imgEl.closest('[data-carousel-item]');
        if (slide) {
          slide.remove();
          console.warn(`Logo removed: ${brandName} – ${reason}`);
        }
      };

      imgEl.addEventListener('error', () => remove('image-error'));
      imgEl.addEventListener('load', () => {
        const { naturalWidth: w, naturalHeight: h } = imgEl;
        if (!w || !h) return remove('zero-dimension');
        const ratioOK = h <= w * 1.2 || imgEl.dataset.isSquare === 'true';
        if (!ratioOK) return remove('aspect-ratio');
        // passed basic checks: keep slide
      });
    };

    // Apply validation to all logo images
    const images = carouselRef.current.querySelectorAll<HTMLImageElement>('[data-logo-img]');
    images.forEach((img) => {
      const brandName = img.alt.replace(' logo', '');
      validateLogo(img, brandName);
    });
  }, []);
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-accent/5 pointer-events-none" />
      
      {/* Floating particles animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold/20 rounded-full animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-primary/10 rounded-full animate-[float_8s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-accent/20 rounded-full animate-[float_7s_ease-in-out_infinite_2s]" />
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-6 px-4 py-2 bg-gold/10 rounded-full border border-gold/30">
            <span className="text-gold font-bold text-sm tracking-wide uppercase">
              Our Alumni Work At
            </span>
          </div>
          
          <h2 className="font-kanit font-semibold text-primary mb-6" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
            From Your Current Job to These Top Companies
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our students have successfully transitioned into roles at world-leading organizations
          </p>
        </div>

        {/* Company Logos Carousel */}
        <div ref={carouselRef} className="relative">
          {/* Fade gradient masks for infinite scroll effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: false,
            }}
            plugins={[autoplayPlugin]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {duplicatedCompanies.map((company, index) => (
                <CarouselItem 
                  key={`${company.name}-${index}`}
                  className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 animate-fade-in"
                  data-carousel-item
                  style={{ animationDelay: `${(index % clientCompanies.length) * 0.1}s` }}
                >
                    <div className="group relative animate-[float_6s_ease-in-out_infinite]" style={{ animationDelay: `${(index % 3) * 0.5}s` }}>
                      <div className="relative bg-card rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-2xl hover:shadow-gold/20 hover:border-gold/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 backdrop-blur-sm will-change-transform">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                        </div>
                        
                        {/* Glossy overlay effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/0 via-gold/0 to-gold/0 group-hover:from-gold/10 group-hover:via-gold/5 group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />
                        
                        <div className="relative flex items-center justify-center h-20">
                          <img 
                            src={company.logo}
                            alt={`${company.name} logo`}
                            className="max-h-full max-w-full object-contain transition-all duration-500 group-hover:scale-110 group-hover:brightness-110 will-change-transform"
                            loading="lazy"
                            data-logo-img
                          />
                        </div>
                      </div>
                    </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Trust indicator */}
        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p className="text-muted-foreground text-sm">
            <span className="font-semibold text-gold animate-[pulse_3s_ease-in-out_infinite]">300+</span> successful career transitions to top companies
          </p>
        </div>
      </div>
    </section>
  );
}
