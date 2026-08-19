import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

/**
 * Komponen ErrorBoundary React
 * Menangkap error runtime yang tidak terduga pada seluruh komponen tree dan mencegah blank white screen.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-5">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              Terjadi Kendala Memuat Halaman
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Sistem mendeteksi kendala pada rendering komponen. Silakan muat ulang halaman atau kembali ke dashboard utama.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left overflow-x-auto max-h-40">
                <p className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-bold">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="primary" icon={RefreshCw} onClick={this.handleReload} className="w-full sm:w-auto">
                Muat Ulang Halaman
              </Button>
              <Button variant="outline" icon={Home} onClick={this.handleReset} className="w-full sm:w-auto">
                Kembali ke Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
