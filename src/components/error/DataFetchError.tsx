import { AlertTriangle, RefreshCw, Database, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DataFetchErrorProps {
  title?: string;
  description?: string;
  error?: Error | string;
  onRetry?: () => void;
  retrying?: boolean;
  showDetails?: boolean;
}

export function DataFetchError({
  title = "Failed to Load Data",
  description = "We couldn't fetch the data you requested. This might be a temporary issue.",
  error,
  onRetry,
  retrying = false,
  showDetails = true,
}: DataFetchErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const isNetworkError = errorMessage?.toLowerCase().includes('network') || 
                         errorMessage?.toLowerCase().includes('fetch');

  return (
    <div className="flex items-center justify-center p-8 animate-fade-in">
      <Card className="max-w-md w-full border-warning/50 shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
            {isNetworkError ? (
              <WifiOff className="w-8 h-8 text-warning" />
            ) : (
              <Database className="w-8 h-8 text-warning" />
            )}
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              {title}
            </CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showDetails && errorMessage && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">Technical Details:</p>
              <p className="text-xs text-muted-foreground font-mono break-words">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">You can try:</p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Refreshing the page</li>
              <li>Checking your internet connection</li>
              <li>Trying again in a few moments</li>
            </ul>
          </div>

          {onRetry && (
            <Button
              onClick={onRetry}
              disabled={retrying}
              className="w-full gap-2"
              variant="default"
            >
              {retrying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Retry Now
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
