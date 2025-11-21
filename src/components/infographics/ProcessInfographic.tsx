import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface ProcessStep {
  number: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface ProcessInfographicProps {
  steps: ProcessStep[];
  title?: string;
}

export function ProcessInfographic({ steps, title }: ProcessInfographicProps) {
  return (
    <div className="space-y-8">
      {title && (
        <h3 className="font-kanit text-3xl font-bold text-center bg-gradient-to-r from-primary via-accent to-gold bg-clip-text text-transparent">
          {title}
        </h3>
      )}
      
      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-gold transform -translate-x-1/2 hidden lg:block" />
        
        <div className="space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex items-center gap-8 ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } flex-col`}
            >
              {/* Content Card */}
              <Card className={`flex-1 border-2 hover:border-accent transition-all duration-300 hover:shadow-xl ${
                index % 2 === 0 ? 'lg:mr-8' : 'lg:ml-8'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center flex-shrink-0">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-kanit text-xl font-bold mb-2">{step.title}</h4>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Center Number Circle */}
              <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                  className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-4 border-background shadow-lg z-10"
                >
                  <span className="font-kanit text-2xl font-bold">{step.number}</span>
                </motion.div>
              </div>

              {/* Mobile Number */}
              <div className="lg:hidden">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <span className="font-kanit text-xl font-bold">{step.number}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
