import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-parchment flex items-center justify-center p-4 font-body text-charcoal">
          <div className="max-w-md w-full bg-ivory border-2 border-gold/30 rounded-lg p-8 shadow-xl text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-saffron-light/20 rounded-full flex items-center justify-center">
                <ShieldAlert className="w-10 h-10 text-saffron" />
              </div>
            </div>
            
            <h1 className="text-3xl font-heading font-bold text-charcoal mb-2">
              काहीतरी चूक झाली
            </h1>
            <p className="text-xl font-heading text-stone mb-6">
              Something went wrong
            </p>
            
            <div className="flex flex-col space-y-4">
              <button 
                onClick={this.handleReload}
                className="w-full py-3 px-6 bg-saffron text-ivory rounded font-medium hover:bg-saffron-dark transition-colors duration-200"
              >
                पुन्हा प्रयत्न करा / Try Again
              </button>
              
              <a 
                href="/"
                className="w-full py-3 px-6 border-2 border-gold text-charcoal rounded font-medium hover:bg-gold/10 transition-colors duration-200"
              >
                मुखपृष्ठावर जा / Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
