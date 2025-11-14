import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center p-8 animate-fade-in">
      <Card className="max-w-md w-full text-center border-dashed">
        <CardHeader className="space-y-6 pb-4">
          <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            <Icon className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="text-base">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
          {action && (
            <Button onClick={action.onClick} className="w-full">
              {action.label}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
