'use client';

import { Wallet } from '@mercadopago/sdk-react';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    if (preferenceId) {
      setIsReady(true);
      onReady?.();
    }
  }, [preferenceId, onReady]);

  if (!preferenceId || !isReady) {
    return <div className="text-center text-gray-500">Preparando método de pago...</div>;
  }

  return (
    <div className="mercadopago-wallet">
      <Wallet
        initialization={{ preferenceId }}
        customization={{ 
          texts: { 
            valueProp: 'smart_option' 
          }
        }}
        onReady={() => {
          console.log('MercadoPago Wallet ready');
          onReady?.();
        }}
        onError={(error) => {
          console.error('MercadoPago Wallet error:', error);
          onError?.(error);
        }}
      />
    </div>
  );
}
