import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface CourseButtonProps extends ButtonProps {
  courseThemed?: boolean;
}

export const CourseButton = forwardRef<HTMLButtonElement, CourseButtonProps>(
  ({ className, courseThemed = false, variant = 'default', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(
          courseThemed && variant === 'default' && 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all',
          courseThemed && variant === 'outline' && 'border-primary/30 hover:bg-course-bg hover:border-primary text-primary transition-all',
          className
        )}
        {...props}
      />
    );
  }
);

CourseButton.displayName = 'CourseButton';
