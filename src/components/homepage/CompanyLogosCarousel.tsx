import { clientCompanies } from '@/data/clientCompanies';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export function CompanyLogosCarousel() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-accent/5 pointer-events-none" />
      
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
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 2500,
              stopOnInteraction: false,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {clientCompanies.map((company, index) => (
              <CarouselItem key={index} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                  <div className="group relative">
                    <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-xl hover:border-gold/30 transition-all duration-300 hover:-translate-y-1">
                      {/* Glossy overlay effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative flex items-center justify-center h-20">
                        <img 
                          src={company.logo}
                          alt={`${company.name} logo`}
                          className="max-h-full max-w-full object-contain transition-all duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden text-center">
                          <div className="text-2xl font-bold text-primary">
                            {company.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {company.category}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Trust indicator */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            <span className="font-semibold text-gold">300+</span> successful career transitions to top companies
          </p>
        </div>
      </div>
    </section>
  );
}
