/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect, useState } from "react";
import { RootState } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

interface CheckoutProps {
  clientSecret: string;
  amount: string;
  Cart: any;
}

interface CartItem {
  cart_item_id: number;
  userid: string;
  id: string;
  name: string;
  image: string;
  price: number;
  qty: number;
}

const Checkout: React.FC<CheckoutProps> = ({ clientSecret, amount, Cart }: CheckoutProps) => {
  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!);
  }, []);

  return (
    <div className="flex flex-row justify-around items-center w-90p p-5 border-0 border-solid border-gray-300">
      {clientSecret && (
        <Wallet 
          initialization={{ preferenceId: clientSecret }} 
          customization={{ texts: { valueProp: 'smart_option' }}}
        />
      )}
      <div>
        <table className="min-w-full bg-gray-800 rounded-lg border-0 border-solid border-gray-400">
          <thead className="border-b border-gray-400 text-gray-300">
            <tr>
              <th className="p-5 text-left">Product</th>
              <th className="p-5 text-right">Quantity</th>
              <th className="p-5 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {Cart.map((item: CartItem) => (
              <tr key={item.id} className="border-b border-gray-400 text-gray-400">
                <td>
                  <Link
                    href={`/product/${item.id}`}
                    className="flex items-center"
                  >
                    <Image
                      src={item.image}
                      alt={item.id}
                      width={50}
                      height={50}
                      className="p-1 rounded-md"
                    ></Image>
                    {item.name}
                  </Link>
                </td>
                <td className="p-5 text-right">
                  <h1>{item.qty}</h1>
                </td>
                <td className="p-5 text-right">${item.price}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>Total</th>
              <th>{amount}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default function CheckOutWrapper() {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [amount, setAmount] = useState('$3400')
  const { payment_intent, cartItems, itemsPrice } = useSelector((state: RootState) => state.cart);
  const searchParams = useSearchParams()
  const status = searchParams.get('redirect_status')
  const prevPay = searchParams.get('payment_intent_client_secret')

  useEffect(() => {
    if (!status && !prevPay) {
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemsPrice, payment_intent }),
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.preference.id);
          setAmount(data.preference.amount);
        });
    }
  }, []);

  return <Checkout clientSecret={clientSecret} amount={amount} Cart={cartItems} />;
}
