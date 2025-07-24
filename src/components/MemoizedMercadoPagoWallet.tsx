'use client';

import React from 'react';
import MercadoPagoWallet from './MercadoPagoWallet';

interface MemoizedMercadoPagoWalletProps {
  preferenceId: string;
  onReady?: () => void;
  onError?: (error: any) => void;
}

const MemoizedMercadoPagoWallet = React.memo(function MemoizedMercadoPagoWallet({ 
  preferenceId, 
  onReady, 
  onError 
}: MemoizedMercadoPagoWalletProps) {
  console.log('🔄 Rendering MercadoPago Wallet for preference:', preferenceId);
  
  return (
    <MercadoPagoWallet
      preferenceId={preferenceId}
      onReady={onReady}
      onError={onError}
    />
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si cambia el preferenceId
  const shouldSkipRender = prevProps.preferenceId === nextProps.preferenceId;
  if (shouldSkipRender) {
    console.log('⚠️ Skipping MercadoPago Wallet re-render, same preferenceId');
  }
  return shouldSkipRender;
});

export default MemoizedMercadoPagoWallet;
