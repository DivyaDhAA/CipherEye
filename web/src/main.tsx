import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CypherEye UI Error Boundary caught an exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#06080f',
          color: '#ffffff',
          fontFamily: "'Inter', sans-serif",
          padding: '24px'
        }}>
          <div style={{
            background: 'rgba(13, 18, 31, 0.95)',
            border: '1px solid rgba(79, 124, 255, 0.25)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            padding: '40px',
            borderRadius: '24px',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <span style={{ fontSize: '32px' }}>🛡️</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px', color: '#ffffff' }}>
              Security Console Recovered
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '28px' }}>
              An unexpected UI runtime exception was isolated by CypherEye Error Boundary. The application state remains secure.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                background: '#4F7CFF',
                color: '#ffffff',
                border: 'none',
                padding: '14px 28px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(79, 124, 255, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              Reload Security Console
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
