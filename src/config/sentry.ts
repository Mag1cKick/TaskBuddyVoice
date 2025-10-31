/**
 * Sentry Configuration
 * 
 * Error tracking and performance monitoring setup.
 * 
 * To use Sentry:
 * 1. Sign up at https://sentry.io
 * 2. Create a new project for React
 * 3. Add VITE_SENTRY_DSN to your .env file
 * 4. Optionally add VITE_SENTRY_ENVIRONMENT (defaults to 'development' or 'production')
 */

import * as Sentry from '@sentry/react';
import { isProduction, isDevelopment } from './env';

interface SentryConfig {
  enabled: boolean;
  dsn?: string;
  environment: string;
}

/**
 * Get Sentry configuration from environment
 */
function getSentryConfig(): SentryConfig {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 
                     (isProduction() ? 'production' : 'development');

  return {
    enabled: Boolean(dsn),
    dsn,
    environment,
  };
}

/**
 * Initialize Sentry error tracking
 */
export function initSentry(): void {
  const config = getSentryConfig();

  if (!config.enabled) {
    if (isDevelopment()) {
      console.log('ℹ️  Sentry is not configured. Add VITE_SENTRY_DSN to enable error tracking.');
    }
    return;
  }

  try {
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: isProduction() ? 0.1 : 1.0,
      
      // Capture Replay for 10% of all sessions,
      // plus 100% of sessions with an error
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Integrations
      integrations: [
        // React Router integration
        Sentry.browserTracingIntegration(),
        
        // Session Replay
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Filter out common non-error events
      beforeSend(event, hint) {
        // Don't send events in development unless explicitly enabled
        if (isDevelopment() && !import.meta.env.VITE_SENTRY_DEBUG) {
          console.log('Sentry event (not sent in dev):', event, hint);
          return null;
        }

        // Filter out network errors that are expected
        const error = hint.originalException;
        if (error instanceof Error) {
          // Don't report auth errors (user not logged in, etc.)
          if (error.message.includes('auth') || error.message.includes('session')) {
            return null;
          }
        }

        return event;
      },

      // Ignore certain errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',
        
        // Network errors
        'NetworkError',
        'Failed to fetch',
        'Load failed',
        
        // Random plugins/extensions
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
    });

    console.log('✅ Sentry initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Sentry:', error);
  }
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (isDevelopment()) {
    console.error('Error captured:', error, context);
  }
  
  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  });
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  if (isDevelopment()) {
    console.log(`[${level}] ${message}`);
  }
  
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, unknown>): void {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
}

/**
 * Wrap a function with error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return ((...args: unknown[]) => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureException(error, context);
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      if (error instanceof Error) {
        captureException(error, context);
      }
      throw error;
    }
  }) as T;
}

