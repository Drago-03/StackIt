import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

// Performance monitoring
export function initPerformanceMonitoring() {
  // Core Web Vitals
  onCLS(console.log);
  onINP(console.log); // onFID has been replaced with onINP in newer versions
  onFCP(console.log);
  onLCP(console.log);
  onTTFB(console.log);

  // Custom performance marks
  performance.mark('app-start');
}

export function markPerformance(name: string) {
  performance.mark(name);
}

export function measurePerformance(name: string, startMark: string) {
  performance.measure(name, startMark);
  const measure = performance.getEntriesByName(name)[0];
  console.log(`${name}: ${measure.duration}ms`);
}

// Image lazy loading utility
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// Debounce utility for search
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for scroll events
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}