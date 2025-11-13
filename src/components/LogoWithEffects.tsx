import titansLogo from "@/assets/titans-logo.jpg";

export const LogoWithEffects = () => {
  // Calculate positions for 12 sparkles in a circle
  const sparklePositions = [
    { angle: 0, distance: 30 },
    { angle: 30, distance: 35 },
    { angle: 60, distance: 30 },
    { angle: 90, distance: 35 },
    { angle: 120, distance: 30 },
    { angle: 150, distance: 35 },
    { angle: 180, distance: 30 },
    { angle: 210, distance: 35 },
    { angle: 240, distance: 30 },
    { angle: 270, distance: 35 },
    { angle: 300, distance: 30 },
    { angle: 330, distance: 35 },
  ];

  const calculateTransform = (angle: number, distance: number) => {
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians) * distance;
    const y = Math.sin(radians) * distance;
    return `translate(${x}px, ${y}px)`;
  };

  return (
    <div className="relative w-10 h-10 group/logo">
      {/* Sparkle particles */}
      {sparklePositions.map((pos, index) => (
        <span
          key={index}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-accent pointer-events-none opacity-0 group-hover/logo:animate-[sparkle_1s_ease-out_forwards]"
          style={{
            // @ts-ignore - CSS custom property
            "--sparkle-end-position": calculateTransform(pos.angle, pos.distance),
            animationDelay: `${index * 0.08}s`,
            willChange: "transform, opacity",
          }}
        />
      ))}
      
      {/* Logo with rotation and glow */}
      <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center transition-all duration-300 shadow-md group-hover/logo:animate-[logo-rotate_0.6s_ease-in-out,logo-glow-pulse_2s_ease-in-out_infinite] will-change-transform">
        <img 
          src={titansLogo} 
          alt="Titans Careers Logo" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};
