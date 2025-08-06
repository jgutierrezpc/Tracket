/**
 * Performance optimization utilities for the Courts page
 */

import { useMemo, useCallback, useRef, useEffect, useState, lazy, Suspense } from 'react';

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit the rate of function calls
 */
export function throttle<T extends (...args: any[]) => any>(
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

/**
 * Hook for intersection observer to detect when elements are visible
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<Element | null>(null);

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    setIsIntersecting(entry.isIntersecting);
    setEntry(entry);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(callback, options);
    observer.observe(element);

    return () => observer.disconnect();
  }, [callback, options]);

  return { elementRef, isIntersecting, entry };
}

/**
 * Hook for virtual scrolling optimization
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    
    return {
      start: Math.max(0, start - overscan),
      end,
      offsetY: start * itemHeight,
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const handleScroll = useCallback(
    throttle((event: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop);
    }, 16), // ~60fps
    []
  );

  return {
    containerRef,
    visibleRange,
    handleScroll,
    totalHeight: items.length * itemHeight,
  };
}

/**
 * Hook for memoized expensive computations
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

/**
 * Hook for memoized callbacks with stable references
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  return useCallback(callback, [callback]);
}

/**
 * Hook for detecting if component is mounted
 */
export function useIsMounted() {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}

/**
 * Hook for preventing unnecessary re-renders
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

/**
 * Hook for detecting if value has changed
 */
export function useHasChanged<T>(value: T): boolean {
  const previousValue = usePrevious(value);
  return previousValue !== undefined && previousValue !== value;
}

/**
 * Performance monitoring utilities
 */
export const performanceUtils = {
  /**
   * Measure execution time of a function
   */
  measureTime: <T extends (...args: any[]) => any>(
    fn: T,
    label?: string
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      if (label) {
        console.log(`${label} took ${end - start}ms`);
      }
      
      return result;
    }) as T;
  },

  /**
   * Create a performance mark
   */
  mark: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  /**
   * Create a performance measure
   */
  measure: (name: string, startMark: string, endMark: string) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      performance.measure(name, startMark, endMark);
    }
  },
};

/**
 * Lazy loading utilities
 */
export const lazyUtils = {
  /**
   * Create a lazy component with error boundary
   */
  withErrorBoundary: <T extends React.ComponentType<any>>(
    lazyComponent: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ) => {
    const LazyComponent = lazy(lazyComponent);
    
    return (props: React.ComponentProps<T>) => (
      <Suspense fallback={fallback ? <fallback /> : <div>Loading...</div>}>
        <LazyComponent {...props} />
      </Suspense>
    );
  },

  /**
   * Preload a lazy component
   */
  preload: <T extends React.ComponentType<any>>(
    lazyComponent: () => Promise<{ default: T }>
  ) => {
    return () => {
      lazyComponent();
    };
  },
}; 