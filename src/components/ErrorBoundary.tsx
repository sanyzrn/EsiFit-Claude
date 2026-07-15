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
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-4xl font-black text-red-500 mb-4">Something went wrong</h1>
          <p className="text-gray-400 mb-8 max-w-md">
            We've encountered an unexpected error. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <pre className="mt-8 p-4 bg-gray-900 rounded-lg text-left text-red-400 text-sm overflow-auto max-w-2xl w-full">
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
