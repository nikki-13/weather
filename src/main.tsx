import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { setupDatabase } from './services/databaseService';

// Add a global error handler to catch unhandled exceptions
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error });
  return false;
};

// Add a promise rejection handler
window.onunhandledrejection = (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
};

console.log('Weather app starting...');
const rootElement = document.getElementById("root");
console.log('Root element found:', !!rootElement);

if (!rootElement) {
  console.error('Root element not found! Cannot mount React application.');
  document.body.innerHTML = '<h1>Error: Could not find root element to mount application</h1>';
} else {
  // Immediately render a basic loading state
  const loadingRoot = createRoot(rootElement);
  loadingRoot.render(
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h1>Loading Weather Dashboard...</h1>
      <p>Initializing application...</p>
    </div>
  );

  // Then initialize the database and the full app
  setupDatabase()
    .then(success => {
      if (success) {
        console.log('Database initialized successfully');
      } else {
        console.warn('Database initialization failed, falling back to localStorage');
      }
      
      // Render the app regardless of database initialization result
      console.log('About to render React app...');
      try {
        createRoot(rootElement).render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
        console.log('React app rendered successfully');
      } catch (error) {
        console.error('Error rendering React app:', error);
        createRoot(rootElement).render(
          <div style={{ textAlign: 'center', marginTop: '3rem', color: 'red' }}>
            <h1>Error Starting Application</h1>
            <p>There was a problem rendering the application. Please check the console for details.</p>
            <pre style={{ textAlign: 'left', margin: '1rem auto', maxWidth: '600px', background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </div>
        );
      }
    })
    .catch(error => {
      console.error('Critical error during app initialization:', error);
      createRoot(rootElement).render(
        <div style={{ textAlign: 'center', marginTop: '3rem', color: 'red' }}>
          <h1>Application Initialization Failed</h1>
          <p>There was a problem initializing the database. Please check the console for details.</p>
        </div>
      );
    });
}
