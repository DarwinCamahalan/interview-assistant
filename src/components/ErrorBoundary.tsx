import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
          <div className="glass-card rounded-2xl p-8 max-w-lg mx-4 scale-in">
            <div className="flex flex-col items-center gap-6">
              {/* Error Icon */}
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Error Content */}
              <div className="text-center space-y-2">
                <h2 className="text-white text-xl font-semibold">
                  Oops! Something went wrong
                </h2>
                <p className="text-white/60 text-sm">
                  The application encountered an unexpected error.
                </p>
              </div>

              {/* Error Details (collapsible) */}
              {this.state.error && (
                <details className="w-full">
                  <summary className="text-white/50 text-xs cursor-pointer hover:text-white/70 transition-colors">
                    Show error details
                  </summary>
                  <div className="mt-3 p-4 bg-black/40 rounded-lg">
                    <pre className="text-red-400 text-xs overflow-auto max-h-40">
                      {this.state.error.toString()}
                      {this.state.errorInfo && (
                        <>
                          {'\n\n'}
                          {this.state.errorInfo.componentStack}
                        </>
                      )}
                    </pre>
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-4 py-2.5 rounded-lg glass-panel hover:bg-white/10 text-white text-sm font-medium transition-all duration-200 modern-button"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleRetry}
                  className="flex-1 px-4 py-2.5 rounded-lg gradient-accent text-white text-sm font-medium transition-all duration-200 hover:shadow-lg modern-button"
                >
                  Reload App
                </button>
              </div>

              {/* Help Text */}
              <p className="text-white/40 text-xs text-center">
                If this problem persists, try restarting the application or check your API key settings.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


