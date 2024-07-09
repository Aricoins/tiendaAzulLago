"use client";
import React, { useEffect } from 'react';

const PaymentBrick = () => {
  useEffect(() => {
    const initializeMercadoPago = async () => {
      const mp = new window.MercadoPago('APP_USR-92fad406-3143-4c51-bd74-dfb2f79bbd4a', {
        locale: 'es'
      });
      const bricksBuilder = mp.bricks();
      const renderPaymentBrick = async (bricksBuilder) => {
        const settings = {
          initialization: {
            amount: 10000,
            preferenceId: "<PREFERENCE_ID>",
            payer: {
              firstName: "",
              lastName: "",
              email: "",
            },
          },
          customization: {
            visual: {
              style: {
                theme: "default",
              },
            },
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
              ticket: "all",
              maxInstallments: 1,
            },
          },
          callbacks: {
            onReady: () => {
              // Callback llamado cuando el Brick está listo.
            },
            onSubmit: ({ selectedPaymentMethod, formData }) => {
              return new Promise((resolve, reject) => {
                fetch("/process_payment", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(formData),
                })
                  .then((response) => response.json())
                  .then((response) => {
                    // recibir el resultado del pago
                    resolve();
                  })
                  .catch((error) => {
                    // manejar la respuesta de error al intentar crear el pago
                    reject();
                  });
              });
            },
            onError: (error) => {
              // callback llamado para todos los casos de error de Brick
              console.error(error);
            },
          },
        };
        window.paymentBrickController = await bricksBuilder.create(
          "payment",
          "paymentBrick_container",
          settings
        );
      };
      await renderPaymentBrick(bricksBuilder);
    };

    // Load MercadoPago script and initialize it
    const script = document.createElement('script');
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.onload = initializeMercadoPago;
    document.body.appendChild(script);

    // Clean up the script when the component is unmounted
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="paymentBrick_container"></div>;
};

export default PaymentBrick;
