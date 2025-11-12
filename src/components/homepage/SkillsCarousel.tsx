import { skills } from '@/data/skills';
import { Badge } from '@/components/ui/badge';

export function SkillsCarousel() {
  // Triple the array for seamless infinite looping
  const skillsList = [...skills, ...skills, ...skills];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-tc-navy mb-4">
            Master Industry-Standard Tools & Technologies
          </h2>
          <p className="text-lg text-tc-grey max-w-3xl mx-auto">
            Learn the exact skills employers are hiring for in 2025
          </p>
        </div>

        <div className="relative flex overflow-hidden">
          <div className="flex gap-4 items-center animate-scroll-left-slow">
            {skillsList.map((skill, index) => (
              <Badge
                key={`${skill.name}-${index}`}
                variant="secondary"
                className="flex-shrink-0 text-base px-6 py-3 bg-white hover:bg-tc-navy hover:text-white transition-all duration-300 cursor-default border border-tc-navy/10 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  {typeof skill.logo === 'string' && skill.logo.startsWith('http') ? (
                    <img 
                      src={skill.logo} 
                      alt={`${skill.name} logo`} 
                      className="h-3 w-3 object-contain flex-shrink-0" 
                    />
                  ) : (
                    <span className="text-xl">{skill.logo}</span>
                  )}
                  <span className="whitespace-nowrap">{skill.name}</span>
                </div>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
