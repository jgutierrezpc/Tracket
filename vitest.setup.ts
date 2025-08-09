import '@testing-library/jest-dom';
import React from 'react';

// Ensure React is available in the test environment for JSX runtime expectations
// Some components/tests assume React is globally available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).React = React;

// Polyfills for UI libraries and charts in test environment
if (!(globalThis as any).ResizeObserver) {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
}