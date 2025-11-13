import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ContactMethodCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  value: string;
  action: string;
  link: string;
  iconColor?: string;
}

export function ContactMethodCard({
  icon: Icon,
  title,
  description,
  value,
  action,
  link,
  iconColor = "text-accent"
}: ContactMethodCardProps) {
  return (
    <Card className="group border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-card h-full">
      <CardContent className="p-8 text-center space-y-6 h-full flex flex-col">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-kanit text-2xl font-bold text-primary mb-3">{title}</h3>
          <p className="font-sans text-muted-foreground mb-4 leading-relaxed">{description}</p>
          <p className="font-sans text-lg font-bold text-foreground">{value}</p>
        </div>
        
        <a href={link} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base py-6 transition-all duration-300 group-hover:shadow-lg">
            {action}
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
