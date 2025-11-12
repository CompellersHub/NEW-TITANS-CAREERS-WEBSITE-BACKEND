import { skills } from '@/data/skills';
import { useState } from 'react';
import { SkillLogo } from './SkillLogo';

export function SkillsCarouselOptionB() {
  // Create diagonal flowing grid
  const skillsExtended = [...skills, ...skills, ...skills];

  return (
    <section className="py-20 bg-gradient-to-br from-tc-navy/5 via-white to-tc-blue/5 overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-tc-blue/20 via-transparent to-tc-amber/20 animate-pulse" />
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
            Option B: Diagonal Flowing Grid
          </div>
        </div>

        {/* Diagonal grid with staggered animations */}
        <div className="relative" style={{ perspective: '1000px' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 transform rotate-[-2deg]">
            {skillsExtended.map((skill, index) => (
              <DiagonalSkillCard 
                key={`${skill.name}-${index}`} 
                skill={skill} 
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DiagonalSkillCard({ skill, index }: { skill: typeof skills[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate staggered animation delay
  const delay = (index % 6) * 0.05;

  return (
    <div 
      className="group relative"
      style={{ 
        animationDelay: `${delay}s`,
        transform: isHovered ? 'translateZ(50px) scale(1.1)' : 'translateZ(0) scale(1)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Radial glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-3xl transition-all duration-700 -z-10"
        style={{ 
          background: `radial-gradient(circle, ${skill.brandColor}60, transparent 70%)`,
          transform: 'scale(1.5)',
        }}
        aria-hidden="true"
      />
      
      {/* Card with glass effect */}
      <div 
        className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 border-2 transition-all duration-500 hover:border-opacity-100 shadow-lg hover:shadow-2xl aspect-square flex flex-col items-center justify-center gap-3 transform rotate-[2deg] group-hover:rotate-0"
        style={{ 
          borderColor: `${skill.brandColor}30`,
        }}
      >
        {/* Animated gradient overlay */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"
          style={{ 
            background: `linear-gradient(135deg, ${skill.brandColor}, transparent)`,
          }}
        />
        
        {/* Logo */}
        <div 
          className="transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 relative z-10"
          style={{
            filter: `drop-shadow(0 4px 16px ${skill.brandColor}80)`,
          }}
        >
          <SkillLogo 
            name={skill.name}
            logo={skill.logo}
            brandColor={skill.brandColor}
            size={56}
            className="transition-all duration-500"
          />
        </div>

        {/* Pulse ring on hover */}
        {isHovered && (
          <div 
            className="absolute inset-0 rounded-3xl animate-ping opacity-20"
            style={{ 
              border: `2px solid ${skill.brandColor}`,
            }}
          />
        )}
      </div>

      {/* Floating tooltip */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 w-56">
        <div 
          className="px-4 py-3 rounded-2xl shadow-2xl text-white text-sm backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-300"
          style={{ 
            backgroundColor: skill.brandColor,
            boxShadow: `0 12px 48px ${skill.brandColor}80`
          }}
        >
          <div className="font-bold mb-1">{skill.name}</div>
          <div className="opacity-90 text-xs">{skill.description}</div>
        </div>
      </div>
    </div>
  );
}
