'use client'
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ClerkErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Clerk Error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                        <div className="text-center mb-6">
                            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error de Autenticación</h2>
                            <p className="text-gray-600 mb-6">
                                Hubo un problema con el sistema de autenticación. Por favor, intenta recargar la página.
                            </p>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Error técnico:</h4>
                            <p className="text-xs text-yellow-700 font-mono">
                                {this.state.error?.message || 'Error desconocido'}
                            </p>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Posibles soluciones:</h4>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• Verifica tu conexión a internet</li>
                                <li>• Recarga la página</li>
                                <li>• Limpia la caché del navegador</li>
                                <li>• Si el problema persiste, contacta al administrador</li>
                            </ul>
                        </div>
                        
                        <div className="flex space-x-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Recargar
                            </button>
                            <Link 
                                href="/" 
                                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Volver al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ClerkErrorBoundary;
