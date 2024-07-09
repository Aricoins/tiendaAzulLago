"use client";

import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
initMercadoPago(process.env.PUBLIC_MP_ID || 'APP_USR-92fad406-3143-4c51-bd74-dfb2f79bbd4a');

console.log('Wallet', Wallet);

export default function Payment() {
  
    return (  
<div>
    <Wallet initialization={{ preferenceId: "APP_USR-92fad406-3143-4c51-bd74-dfb2f79bbd4a" }} />
      </div>
      );
}