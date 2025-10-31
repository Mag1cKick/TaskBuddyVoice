import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Send to Sentry
    try {
      // Dynamically import to avoid bundling issues if Sentry is not configured
      import('@/config/sentry').then(({ captureException }) => {
        captureException(error, {
          componentStack: errorInfo.componentStack,
        });
      });
    } catch (sentryError) {
      console.error('Failed to send error to Sentry:', sentryError);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    this.handleReset();
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Oops! Something went wrong</CardTitle>
              </div>
              <CardDescription>
                We encountered an unexpected error. Don't worry, your data is safe.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  <code className="text-sm block overflow-x-auto">
                    {this.state.error?.message || 'Unknown error'}
                  </code>
                </AlertDescription>
              </Alert>

              {import.meta.env.DEV && this.state.errorInfo && (
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium mb-2">
                    Stack Trace (Development Only)
                  </summary>
                  <pre className="overflow-x-auto p-4 bg-muted rounded-md text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="text-sm text-muted-foreground">
                <p>You can try the following:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Refresh the page to try again</li>
                  <li>Go back to the home page</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Contact support if the problem persists</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button onClick={this.handleReset} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version for functional components
 * Note: This is a simplified version. For full error boundary functionality,
 * you still need to use the class component above.
 */
export function useErrorHandler(): (error: Error) => void {
  const [, setError] = React.useState<Error>();
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

