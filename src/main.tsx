// Global fetch interceptor to prepend BASE_URL to api & upload routes
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let updatedInput = input;

  if (typeof input === 'string') {
    if (input.startsWith('/api/') || input.startsWith('/backend/uploads/')) {
      updatedInput = `${base}${input}`;
    }
  } else if (input instanceof URL) {
    if (input.pathname.startsWith('/api/') || input.pathname.startsWith('/backend/uploads/')) {
      updatedInput = new URL(`${input.origin}${base}${input.pathname}${input.search}${input.hash}`);
    }
  } else if (input instanceof Request) {
    const reqUrl = new URL(input.url);
    if (reqUrl.pathname.startsWith('/api/') || reqUrl.pathname.startsWith('/backend/uploads/')) {
      const newUrl = `${reqUrl.origin}${base}${reqUrl.pathname}${reqUrl.search}`;
      updatedInput = new Request(newUrl, input);
    }
  }

  return originalFetch(updatedInput, init);
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
