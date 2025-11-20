import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface Stat {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'accent' | 'gold';
}

interface StatsInfographicProps {
  stats: Stat[];
  columns?: 2 | 3 | 4;
}

function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}</span>;
}

export function StatsInfographic({ stats, columns = 3 }: StatsInfographicProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const colorMap = {
    primary: 'from-primary to-primary/70',
    accent: 'from-accent to-accent/70',
    gold: 'from-gold to-gold/70'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="border-2 hover:border-accent transition-all duration-300 hover:shadow-xl group overflow-hidden relative">
            {/* Animated Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[stat.color || 'primary']} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <CardContent className="p-8 text-center relative">
              {stat.icon && (
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorMap[stat.color || 'primary']} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                </div>
              )}
              
              <div className="font-kanit text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-gold bg-clip-text text-transparent">
                {stat.prefix}
                <AnimatedNumber value={stat.value} />
                {stat.suffix}
              </div>
              
              <div className="text-muted-foreground font-medium text-lg">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
