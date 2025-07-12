import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initMonitoring() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing(),
      ],
      tracesSampleRate: 1.0,
      environment: import.meta.env.MODE,
    });
  }
}

export function logError(error: Error, context?: Record<string, any>) {
  console.error('Application Error:', error);
  
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    });
  }
}

export function logPerformance(name: string, duration: number) {
  console.log(`Performance: ${name} took ${duration}ms`);
  
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${name} took ${duration}ms`,
      level: 'info',
    });
  }
}