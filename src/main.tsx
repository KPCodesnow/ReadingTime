import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

// Add error boundary
try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React mounted successfully');
} catch (error) {
  console.error('Failed to mount React:', error);
  root.innerHTML = `
    <div style="color: red; padding: 20px;">
      Failed to load application. Please check console for errors.
    </div>
  `;
} 