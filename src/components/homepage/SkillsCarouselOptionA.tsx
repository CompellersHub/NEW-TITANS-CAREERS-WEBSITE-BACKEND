import { skills } from '@/data/skills';
import { SkillLogo } from './SkillLogo';

export function SkillsCarouselOptionA() {
  // Triple the skills for seamless infinite loop
  const row1Skills = skills.filter((_, i) => i % 3 === 0);
  const row2Skills = skills.filter((_, i) => i % 3 === 1);
  const row3Skills = skills.filter((_, i) => i % 3 === 2);
  
  const tripleRow1 = [...row1Skills, ...row1Skills, ...row1Skills];
  const tripleRow2 = [...row2Skills, ...row2Skills, ...row2Skills];
  const tripleRow3 = [...row3Skills, ...row3Skills, ...row3Skills];

  return (
    <section className="py-20 bg-gradient-to-b from-tc-light-grey via-white to-tc-light-grey overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30" aria-hidden="true">
        <div className="absolute top-20 left-10 w-64 h-64 bg-tc-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-tc-amber/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-tc-navy mb-4 font-heading">
            Master Industry-Standard Tools
          </h2>
          <p className="text-lg md:text-xl text-tc-grey max-w-3xl mx-auto">
            Learn the exact technologies employers demand in 2025
          </p>
          <div className="mt-4 text-sm text-tc-navy/60 font-medium">
            Option A: Three-Row Parallax Scroll
          </div>
        </div>

        <div className="space-y-6">
          {/* Row 1 - Scrolls Right */}
          <div className="relative flex overflow-hidden group/row">
            <div className="flex gap-4 animate-scroll-left-slow">
              {tripleRow1.map((skill, index) => (
                <SkillCard key={`${skill.name}-${index}`} skill={skill} />
              ))}
            </div>
          </div>

          {/* Row 2 - Scrolls Left (reverse) */}
          <div className="relative flex overflow-hidden group/row">
            <div className="flex gap-4 animate-[scroll-left_50s_linear_infinite_reverse]">
              {tripleRow2.map((skill, index) => (
                <SkillCard key={`${skill.name}-${index}`} skill={skill} delay={0.1} />
              ))}
            </div>
          </div>

          {/* Row 3 - Scrolls Right (faster) */}
          <div className="relative flex overflow-hidden group/row">
            <div className="flex gap-4 animate-[scroll-left_40s_linear_infinite]">
              {tripleRow3.map((skill, index) => (
                <SkillCard key={`${skill.name}-${index}`} skill={skill} delay={0.2} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SkillCard({ skill, delay = 0 }: { skill: typeof skills[0]; delay?: number }) {
  return (
    <div 
      className="group flex-shrink-0 relative"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Brand-colored glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700 scale-150 -z-10"
        style={{ 
          background: `radial-gradient(circle at center, ${skill.brandColor}50, ${skill.brandColor}20, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      
      {/* Glass-morphism card */}
      <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-tc-navy/10 shadow-titans-sm hover:shadow-titans-lg transition-all duration-500 hover:scale-110 hover:-translate-y-1 w-28 h-28 flex items-center justify-center">
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </div>
        
        <div className="flex items-center justify-center relative z-10">
          {/* Logo with brand color glow */}
          <div 
            className="transition-all duration-300 group-hover:scale-125"
            style={{
              filter: `drop-shadow(0 0 12px ${skill.brandColor}80)`,
            }}
          >
            <SkillLogo 
              name={skill.name}
              logo={skill.logo}
              brandColor={skill.brandColor}
              size={48}
              className="transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Tooltip with description */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 w-64">
        <div 
          className="px-4 py-2 rounded-xl shadow-2xl text-white text-xs font-medium backdrop-blur-sm"
          style={{ 
            backgroundColor: skill.brandColor,
            boxShadow: `0 8px 32px ${skill.brandColor}60`
          }}
        >
          <div className="font-bold mb-1">{skill.name}</div>
          <div className="opacity-90">{skill.description}</div>
        </div>
        <div 
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
          style={{ backgroundColor: skill.brandColor }}
        />
      </div>
    </div>
  );
}
