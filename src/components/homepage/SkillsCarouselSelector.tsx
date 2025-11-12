import { useState } from 'react';
import { SkillsCarouselOptionA } from './SkillsCarouselOptionA';
import { SkillsCarouselOptionB } from './SkillsCarouselOptionB';
import { SkillsCarouselOptionC } from './SkillsCarouselOptionC';
import { Button } from '@/components/ui/button';

export function SkillsCarouselSelector() {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C'>('A');

  const options = [
    { id: 'A' as const, name: 'Three-Row Parallax', description: 'Multi-speed scrolling rows' },
    { id: 'B' as const, name: 'Diagonal Grid', description: 'Staggered flowing layout' },
    { id: 'C' as const, name: 'Orbital Circle', description: 'Rotating circular arrangement' },
  ];

  return (
    <div className="relative">
      {/* Option selector */}
      <div className="container py-8 relative z-20">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 bg-tc-navy/5 backdrop-blur-sm rounded-2xl p-2 border border-tc-navy/10">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`
                  group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300
                  ${selectedOption === option.id 
                    ? 'bg-gradient-to-r from-tc-navy to-tc-blue text-white shadow-titans-md' 
                    : 'text-tc-navy hover:bg-white/50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm md:text-base font-bold">{option.name}</span>
                  <span className="text-xs opacity-80">{option.description}</span>
                </div>
                
                {selectedOption === option.id && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-tc-amber/20 to-tc-blue/20 animate-pulse -z-10" />
                )}
              </button>
            ))}
          </div>
          
          <p className="text-sm text-tc-grey text-center max-w-md">
            Preview all three premium carousel designs and choose your favorite
          </p>
        </div>
      </div>

      {/* Render selected carousel */}
      <div className="relative">
        {selectedOption === 'A' && <SkillsCarouselOptionA />}
        {selectedOption === 'B' && <SkillsCarouselOptionB />}
        {selectedOption === 'C' && <SkillsCarouselOptionC />}
      </div>
    </div>
  );
}
