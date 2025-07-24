'use client';

import { useEffect, useRef } from 'react';
import { initMercadoPago } from '@mercadopago/sdk-react';

let mercadoPagoInitialized = false;

export const useMercadoPago = () => {
  const initRef = useRef(false);

  useEffect(() => {
    if (!mercadoPagoInitialized && !initRef.current && typeof window !== 'undefined') {
      try {
        const mpKey = process.env.NEXT_PUBLIC_MP_KEY;
        if (!mpKey) {
          console.error('MercadoPago key not found');
          return;
        }
        
        initMercadoPago(mpKey, { locale: 'es-AR' });
        mercadoPagoInitialized = true;
        initRef.current = true;
        console.log('✅ MercadoPago SDK initialized');
      } catch (error) {
        console.error('❌ Error initializing MercadoPago SDK:', error);
      }
    }
  }, []);

  return { initialized: mercadoPagoInitialized };
};
