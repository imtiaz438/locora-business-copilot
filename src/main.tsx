import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure window.fetch is writable if third-party libraries try to reassign it
if (typeof window !== 'undefined') {
  try {
    let realFetch = window.fetch;
    Object.defineProperty(window, 'fetch', {
      get: () => (typeof realFetch === 'function' ? realFetch.bind(window) : realFetch),
      set: (fn) => {
        realFetch = fn;
      },
      configurable: true,
      enumerable: true,
    });
  } catch (e) {
    // Already defined or non-configurable
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
