'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error & { stack?: string };
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 🔑 AFFICHER DANS LA CONSOLE EXACTEMENT
    console.group('🔴 ERROR BOUNDARY CAUGHT EXCEPTION');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', info.componentStack);
    console.error('Full Error:', error);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '40px',
            fontFamily: 'monospace',
            backgroundColor: '#ffebee',
            border: '2px solid #c62828',
            borderRadius: '8px',
            margin: '20px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          <h1 style={{ color: '#c62828', marginTop: 0 }}>
            🔴 ERREUR CAPTURÉE
          </h1>

          <div
            style={{
              backgroundColor: '#fff3e0',
              padding: '20px',
              borderRadius: '4px',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Message:</h3>
            <code style={{ fontSize: '14px', color: '#d32f2f' }}>
              {this.state.error?.message || 'Erreur inconnue'}
            </code>

            {this.state.error?.stack && (
              <>
                <h3 style={{ marginTop: '20px' }}>Stack Trace:</h3>
                <code
                  style={{
                    fontSize: '12px',
                    color: '#333',
                    display: 'block',
                    backgroundColor: '#fafafa',
                    padding: '10px',
                    borderRadius: '4px',
                    overflowX: 'auto',
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}
                >
                  {this.state.error.stack}
                </code>
              </>
            )}
          </div>

          <div style={{ marginTop: '20px', color: '#666' }}>
            <p>
              ℹ️ <strong>Copie cette erreur et envoie-la pour debug!</strong>
            </p>
            <p>Ouvre aussi F12 → Console → Cherche les logs rouges</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              🔄 Recharger
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
