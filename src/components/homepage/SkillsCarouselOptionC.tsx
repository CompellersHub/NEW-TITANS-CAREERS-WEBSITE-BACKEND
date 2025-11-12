import { skills } from '@/data/skills';
import { useState, useEffect } from 'react';
import { SkillLogo } from './SkillLogo';

export function SkillsCarouselOptionC() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Distribute skills in orbital rings
  const innerRing = skills.slice(0, 8);
  const middleRing = skills.slice(8, 16);
  const outerRing = skills.slice(16);

  return (
    <section className="py-20 bg-gradient-to-b from-white via-tc-light-grey to-white overflow-hidden relative min-h-[800px]">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
          <div className="absolute inset-0 bg-gradient-to-r from-tc-blue/30 to-tc-amber/30 rounded-full blur-3xl animate-pulse" />
        </div>
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
            Option C: Circular Orbital Arrangement
          </div>
        </div>

        {/* Orbital container */}
        <div className="relative mx-auto max-w-4xl aspect-square flex items-center justify-center">
          {/* Center focal point */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-tc-navy to-tc-blue flex items-center justify-center shadow-titans-xl">
                <span className="text-white font-bold text-xl text-center leading-tight">
                  Industry<br />Tools
                </span>
              </div>
              <div className="absolute inset-0 rounded-full bg-tc-amber/30 animate-ping" />
            </div>
          </div>

          {/* Inner ring */}
          <div 
            className="absolute inset-20"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {innerRing.map((skill, index) => (
              <OrbitalSkill 
                key={skill.name}
                skill={skill}
                index={index}
                total={innerRing.length}
                rotation={-rotation}
              />
            ))}
          </div>

          {/* Middle ring */}
          <div 
            className="absolute inset-10"
            style={{ transform: `rotate(${-rotation * 0.7}deg)` }}
          >
            {middleRing.map((skill, index) => (
              <OrbitalSkill 
                key={skill.name}
                skill={skill}
                index={index}
                total={middleRing.length}
                rotation={rotation * 0.7}
              />
            ))}
          </div>

          {/* Outer ring */}
          <div 
            className="absolute inset-0"
            style={{ transform: `rotate(${rotation * 0.5}deg)` }}
          >
            {outerRing.map((skill, index) => (
              <OrbitalSkill 
                key={skill.name}
                skill={skill}
                index={index}
                total={outerRing.length}
                rotation={-rotation * 0.5}
              />
            ))}
          </div>

          {/* Orbital paths */}
          <div className="absolute inset-20 border-2 border-dashed border-tc-navy/10 rounded-full pointer-events-none" />
          <div className="absolute inset-10 border-2 border-dashed border-tc-navy/10 rounded-full pointer-events-none" />
          <div className="absolute inset-0 border-2 border-dashed border-tc-navy/10 rounded-full pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

function OrbitalSkill({ 
  skill, 
  index, 
  total, 
  rotation 
}: { 
  skill: typeof skills[0]; 
  index: number; 
  total: number;
  rotation: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const angle = (360 / total) * index;
  
  return (
    <div
      className="absolute top-1/2 left-1/2 group"
      style={{
        transform: `rotate(${angle}deg) translateY(-50%) translateX(100%)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          transform: `rotate(${rotation}deg) scale(${isHovered ? 1.3 : 1})`,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Glow effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700 -z-10"
          style={{ 
            background: `radial-gradient(circle, ${skill.brandColor}, transparent)`,
            transform: 'scale(2)',
          }}
          aria-hidden="true"
        />

        {/* Skill orb */}
        <div 
          className="relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl transition-all duration-500 shadow-titans-lg hover:shadow-titans-xl cursor-pointer"
          style={{
            background: `linear-gradient(135deg, white, ${skill.brandColor}20)`,
            border: `3px solid ${skill.brandColor}`,
            boxShadow: `0 8px 32px ${skill.brandColor}40`,
          }}
        >
          <div style={{ filter: `drop-shadow(0 2px 12px ${skill.brandColor})` }}>
            <SkillLogo 
              name={skill.name}
              logo={skill.logo}
              brandColor={skill.brandColor}
              size={48}
              className="transition-all duration-500"
            />
          </div>

          {/* Pulse ring */}
          {isHovered && (
            <div 
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                border: `2px solid ${skill.brandColor}`,
                opacity: 0.4,
              }}
            />
          )}
        </div>

        {/* Floating tooltip */}
        <div 
          className="absolute top-full mt-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 w-48"
          style={{
            transform: `translateX(-50%) rotate(${-rotation - angle}deg)`,
          }}
        >
          <div 
            className="px-4 py-3 rounded-xl shadow-2xl text-white text-sm backdrop-blur-sm"
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
    </div>
  );
}
