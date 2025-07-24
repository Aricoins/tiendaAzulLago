'use client';

import { Wallet } from '@mercadopago/sdk-react';
import { useEffect, useState, useRef } from 'react';

interface MercadoPagoWalletProps {
  preferenceId: string;
  onReady?: () => void;
  onError?: (error: any) => void;
}

// Control global de instancias más robusto
const globalWalletControl = {
  activePreference: null as string | null,
  isRendering: false,
  instances: new Set<string>(),
  
  canRender(preferenceId: string, instanceId: string): boolean {
    // Si ya hay una preferencia activa diferente, no permitir
    if (this.activePreference && this.activePreference !== preferenceId) {
      console.log('🚫 Cannot render wallet, different preference active:', this.activePreference);
      return false;
    }
    
    // Si ya se está renderizando, no permitir duplicado
    if (this.isRendering && this.activePreference === preferenceId) {
      console.log('🚫 Cannot render wallet, already rendering for preference:', preferenceId);
      return false;
    }
    
    return true;
  },
  
  startRender(preferenceId: string, instanceId: string) {
    this.activePreference = preferenceId;
    this.isRendering = true;
    this.instances.add(instanceId);
    console.log('🟢 Starting wallet render for preference:', preferenceId, 'instance:', instanceId);
  },
  
  finishRender(instanceId: string) {
    this.isRendering = false;
    console.log('✅ Finished wallet render for instance:', instanceId);
  },
  
  cleanup(instanceId: string) {
    this.instances.delete(instanceId);
    if (this.instances.size === 0) {
      this.activePreference = null;
      this.isRendering = false;
      console.log('🧹 All wallet instances cleaned up');
    }
  }
};

export default function MercadoPagoWallet({ 
  preferenceId, 
  onReady, 
  onError 
}: MercadoPagoWalletProps) {
  const [isReady, setIsReady] = useState(false);
  const onReadyCalledRef = useRef(false);
  const walletContainerRef = useRef<HTMLDivElement>(null);
  const instanceIdRef = useRef<string>(`wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const mountedRef = useRef(true);

  // Cleanup al desmontar
  useEffect(() => {
    mountedRef.current = true;
    const instanceId = instanceIdRef.current;
    return () => {
      mountedRef.current = false;
      globalWalletControl.cleanup(instanceId);
    };
  }, []);

  // Control de renderizado
  useEffect(() => {
    if (!preferenceId || !mountedRef.current) return;

    const instanceId = instanceIdRef.current;
    
    // Verificar si puede renderizar
    if (!globalWalletControl.canRender(preferenceId, instanceId)) {
      setIsReady(false);
      return;
    }

    // Limpiar DOM global agresivamente
    const cleanup = () => {
      const selectors = [
        '.mercadopago-wallet-container',
        '.mp-wallet-container', 
        '[data-cy="wallet-container"]',
        'iframe[src*="mercadopago"]',
        'iframe[src*="checkout"]',
        'iframe[src*="mercadolibre"]'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          console.log('🧹 Removing existing wallet element:', selector);
          el.remove();
        });
      });
    };

    cleanup();
    
    // Registrar renderizado
    globalWalletControl.startRender(preferenceId, instanceId);
    onReadyCalledRef.current = false;

    // Delay para asegurar cleanup completo
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setIsReady(true);
        globalWalletControl.finishRender(instanceId);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      setIsReady(false);
    };
  }, [preferenceId]);

  const handleReady = () => {
    const currentInstanceId = instanceIdRef.current;
    if (!onReadyCalledRef.current && mountedRef.current) {
      console.log('✅ MercadoPago Wallet ready (instance:', currentInstanceId, ')');
      onReadyCalledRef.current = true;
      onReady?.();
    }
  };

  const handleError = (error: any) => {
    console.error('❌ MercadoPago Wallet error:', error);
    onError?.(error);
  };

  // No renderizar si no está listo o no está montado
  if (!preferenceId || !isReady || !mountedRef.current) {
    return <div className="text-center text-gray-500">Preparando método de pago...</div>;
  }

  return (
    <div 
      className="mercadopago-wallet" 
      ref={walletContainerRef}
      data-wallet-instance={instanceIdRef.current}
      data-preference-id={preferenceId}
    >
      <Wallet
        key={`wallet-${preferenceId}-${instanceIdRef.current}`}
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
