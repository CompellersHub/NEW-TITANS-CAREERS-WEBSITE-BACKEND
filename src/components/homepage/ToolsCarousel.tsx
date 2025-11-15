import { skills } from '@/data/skills';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { SkillLogo } from './SkillLogo';

export function ToolsCarousel() {
  // Organize skills by category for better display
  const categories = [
    { name: 'Data Analysis', icon: '📊' },
    { name: 'AML/KYC', icon: '🔍' },
    { name: 'Cloud', icon: '☁️' },
    { name: 'Cybersecurity', icon: '🔒' },
    { name: 'Collaboration', icon: '🤝' },
    { name: 'Business Analysis', icon: '💼' },
  ];

  // Get skills for display
  const displaySkills = skills.slice(0, 30);

  return (
    <section className="py-20 bg-secondary/30 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-6 px-4 py-2 bg-accent/10 rounded-full border border-accent/30">
            <span className="text-accent font-bold text-sm tracking-wide uppercase">
              Industry-Standard Tools
            </span>
          </div>
          
          <h2 className="font-kanit font-semibold text-primary mb-6" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
            Master the Tools Top Companies Use
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Gain hands-on experience with the exact technologies and platforms employers are hiring for
          </p>
        </div>

        {/* Category badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <div 
              key={category.name}
              className="px-4 py-2 bg-card rounded-full border border-border/50 shadow-sm hover:shadow-md hover:border-gold/30 transition-all duration-300"
            >
              <span className="mr-2">{category.icon}</span>
              <span className="text-sm font-medium text-primary">{category.name}</span>
            </div>
          ))}
        </div>

        {/* First Row - Scrolling Left */}
        <div className="mb-8">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 2200,
                stopOnInteraction: false,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {displaySkills.slice(0, 15).map((skill, index) => (
                <CarouselItem key={`tools-row1-${index}`} className="pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/8">
                  <div className="group relative">
                    <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 hover:shadow-2xl hover:border-accent/50 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
                      {/* Glossy overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Glow effect */}
                      <div 
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"
                        style={{ backgroundColor: skill.brandColor }}
                      />
                      
                      <div className="relative">
                        {/* Logo container with fixed height */}
                        <div className="flex items-center justify-center h-16 mb-3">
                          <SkillLogo 
                            name={skill.name}
                            logo={skill.logo}
                            brandColor={skill.brandColor}
                            size={48}
                            className="transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        
                        {/* Skill name */}
                        <div className="text-center">
                          <p className="text-sm font-semibold text-primary group-hover:text-accent transition-colors duration-300">
                            {skill.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {skill.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Second Row - Scrolling Right */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 2700,
              stopOnInteraction: false,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-4" style={{ direction: 'rtl' }}>
            {displaySkills.slice(15, 30).map((skill, index) => (
              <CarouselItem key={`tools-row2-${index}`} className="pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/8" style={{ direction: 'ltr' }}>
                <div className="group relative">
                  <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 hover:shadow-2xl hover:border-accent/50 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Glow effect */}
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"
                      style={{ backgroundColor: skill.brandColor }}
                    />
                    
                    <div className="relative">
                      {/* Logo container with fixed height */}
                      <div className="flex items-center justify-center h-16 mb-3">
                        <SkillLogo 
                          name={skill.name}
                          logo={skill.logo}
                          brandColor={skill.brandColor}
                          size={48}
                          className="transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      
                      {/* Skill name */}
                      <div className="text-center">
                        <p className="text-sm font-semibold text-primary group-hover:text-accent transition-colors duration-300">
                          {skill.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {skill.category}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-card rounded-full border border-gold/30 shadow-lg">
            <span className="text-sm text-muted-foreground">Learn</span>
            <span className="text-xl font-bold text-gold">{displaySkills.length}+</span>
            <span className="text-sm text-muted-foreground">industry-standard tools in our courses</span>
          </div>
        </div>
      </div>
    </section>
  );
}
