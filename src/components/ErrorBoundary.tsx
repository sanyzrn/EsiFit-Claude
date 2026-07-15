import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-app flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-4xl font-black text-danger mb-4">Something went wrong</h1>
          <p className="text-fg-subtle mb-8 max-w-md">
            We've encountered an unexpected error. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-brand text-brand-fg font-semibold rounded-[12px] hover:bg-brand-dark transition-[color,background-color] duration-[180ms]"
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <pre className="mt-8 p-4 bg-surface border border-border rounded-[20px] text-left text-danger text-sm overflow-auto max-w-2xl w-full">
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
