import React from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App';
import './index.css';
import { ConsentProvider } from './analytics/ConsentProvider';
import { StorefrontErrorBoundary } from './components/StorefrontErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StorefrontErrorBoundary>
    <MotionConfig reducedMotion="user">
      <ConsentProvider>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </ConsentProvider>
    </MotionConfig>
  </StorefrontErrorBoundary>
);
