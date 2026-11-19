import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

console.log('🔥 main.jsx loading...');

// Visual error display for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  const existing = document.getElementById('runtime-error-banner');
  if (!existing) {
    const errDiv = document.createElement('div');
    errDiv.id = 'runtime-error-banner';
    errDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:20px;background:#e11d48;color:#ffffff;z-index:999999;font-family:monospace;font-size:14px;white-space:pre-wrap;box-shadow:0 4px 20px rgba(0,0,0,0.5);';
    errDiv.innerText = '⚠️ AeroVelocity Runtime Error:\n' + (event.error?.stack || event.message);
    document.body.prepend(errDiv);
  }
});

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          maxWidth: '900px',
          margin: '60px auto',
          background: 'rgba(255, 0, 64, 0.1)',
          border: '1px solid #ff0040',
          borderRadius: '12px',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h2 style={{ color: '#ff4060', marginBottom: '16px' }}>⚠️ Something went wrong rendering this page</h2>
          <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
            {this.state.error?.message || 'Unknown render error'}
          </p>
          <pre style={{
            background: '#0f1117',
            padding: '16px',
            borderRadius: '8px',
            overflowX: 'auto',
            fontSize: '13px',
            color: '#f87171'
          }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 24px',
              background: '#00d4ff',
              color: '#000',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
console.log('📦 Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ErrorBoundary>
      </StrictMode>,
    );
    console.log('✅ React app rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering React app:', error);
  }
}
