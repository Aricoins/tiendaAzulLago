'use client';

import { Wallet } from '@mercadopago/sdk-react';
import { useEffect, useState, useRef } from 'react';

interface MercadoPagoWalletProps {
  preferenceId: string;
  onReady?: () => void;
  onError?: (error: any) => void;
}

export default function MercadoPagoWallet({ 
  preferenceId, 
  onReady, 
  onError 
}: MercadoPagoWalletProps) {
  const [isReady, setIsReady] = useState(false);
  const onReadyCalledRef = useRef(false);
  const walletContainerRef = useRef<HTMLDivElement>(null);

  // Limpiar contenedor antes de cada render del Wallet
  useEffect(() => {
    if (walletContainerRef.current) {
      // Limpiar cualquier contenido previo del wallet
      const existingWallets = walletContainerRef.current.querySelectorAll('.mercadopago-wallet-container, .mp-wallet-container, [data-cy="wallet-container"], iframe[src*="mercadopago"]');
      existingWallets.forEach(wallet => wallet.remove());
    }
    onReadyCalledRef.current = false;
  }, [preferenceId]);

  useEffect(() => {
    if (preferenceId && !isReady) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [preferenceId, isReady]);

  // Cleanup on unmount
  useEffect(() => {
    const containerRef = walletContainerRef.current;
    return () => {
      if (containerRef) {
        const existingWallets = containerRef.querySelectorAll('.mercadopago-wallet-container, .mp-wallet-container, [data-cy="wallet-container"], iframe[src*="mercadopago"]');
        existingWallets.forEach(wallet => wallet.remove());
      }
    };
  }, []);

  const handleReady = () => {
    if (!onReadyCalledRef.current) {
      console.log('MercadoPago Wallet ready');
      onReadyCalledRef.current = true;
      onReady?.();
    }
  };

  const handleError = (error: any) => {
    console.error('MercadoPago Wallet error:', error);
    onError?.(error);
  };

  if (!preferenceId || !isReady) {
    return <div className="text-center text-gray-500">Preparando método de pago...</div>;
  }

  return (
    <div className="mercadopago-wallet" ref={walletContainerRef}>
      <Wallet
        initialization={{ preferenceId }}
        customization={{ 
          texts: { 
            valueProp: 'smart_option' 
          }
        }}
        onReady={handleReady}
        onError={handleError}
      />
    </div>
  );
}
