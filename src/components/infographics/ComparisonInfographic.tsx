import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface ComparisonItem {
  label: string;
  before: string | boolean;
  after: string | boolean;
}

interface ComparisonInfographicProps {
  title?: string;
  beforeLabel?: string;
  afterLabel?: string;
  items: ComparisonItem[];
}

export function ComparisonInfographic({ 
  title = "Your Career Transformation",
  beforeLabel = "Before",
  afterLabel = "After",
  items 
}: ComparisonInfographicProps) {
  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle2 className="w-6 h-6 text-green-500" />
      ) : (
        <XCircle className="w-6 h-6 text-red-500" />
      );
    }
    return <span className="text-lg font-medium">{value}</span>;
  };

  return (
    <Card className="border-2 border-accent/20 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-gold/5">
        <CardTitle className="font-kanit text-2xl text-center bg-gradient-to-r from-primary via-accent to-gold bg-clip-text text-transparent">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Header Row */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 p-6 bg-muted/30 border-b border-border">
          <div className="text-center">
            <h4 className="font-kanit text-xl font-bold text-muted-foreground">{beforeLabel}</h4>
          </div>
          <div className="flex items-center">
            <ArrowRight className="w-6 h-6 text-accent" />
          </div>
          <div className="text-center">
            <h4 className="font-kanit text-xl font-bold text-primary">{afterLabel}</h4>
          </div>
        </div>

        {/* Comparison Rows */}
        <div className="divide-y divide-border">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="grid grid-cols-[1fr,auto,1fr] gap-4 p-6 hover:bg-muted/20 transition-colors group"
            >
              {/* Before */}
              <div className="flex items-center justify-end gap-3">
                <span className="text-muted-foreground text-right">{item.label}</span>
                <div className="flex-shrink-0">
                  {renderValue(item.before)}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.2 }}
                  className="group-hover:text-accent transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </div>

              {/* After */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {renderValue(item.after)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
