'use client'
import { RootState } from "@/redux/store"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { addToCart, removeFromCart } from "@/redux/slices/cartSlice"
import Link from "next/link"
import Image from "next/image";
import ClipLoader from "react-spinners/ClipLoader";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { useState } from "react";
import axios from "axios";
import 'dotenv/config'

initMercadoPago(process.env.PUBLIC_KEY || 'APP_USR-92fad406-3143-4c51-bd74-dfb2f79bbd4a');

interface Product {
  cart_item_id: number;
  userid: string;
  id: string;
  name: string;
  image: string;
  price: number;
  qty: number;
}

export default function CartPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, cartItems, itemsPrice } = useSelector((state: RootState) => state.cart)
  const [preferenceId, setPreferenceId] = useState(null)

  const addToCartHandler = (product: Product, cart_item_id: number, qty: number) => {
    const updateQtyDB = async () => {
      try {
        let res = await fetch("/api/cart", {
          method: "PUT",
          body: JSON.stringify({ product, cart_item_id, qty }),
        });
        return console.log('qty updated to', qty)    
      } catch (error) {
        console.log('error', error)
      }       
    }
    updateQtyDB()
    dispatch(addToCart({ ...product, qty })) 
  }

  const createPreference = async () => {
    try {
      console.log("Cart items to send:", cartItems);
      const response = await axios.post('/api/create-preference', {
        cartItems,
      });
      console.log("Response from create-payment:", response);

      const preferenceId = response.data.preferenceId;
      setPreferenceId(preferenceId)
      return preferenceId;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const removeFromCartHandler = (id: string, cart_item_id: number) => {
    const removeFromCartDB = async () => {
      try {
        let res = await fetch("/api/cart", {
          method: "DELETE",
          body: JSON.stringify({ cart_item_id }),
        });
        return console.log('deleted', cart_item_id)    
      } catch (error) {
        console.log('error', error)
      }
    }  
    removeFromCartDB()
    dispatch(removeFromCart(id))
  }

  return (
    <div className="flex flex-col flex-wrap content-center">
      <h1 className="mb-4 text-xl text-white">Mi carrito</h1>
      {loading ? (
        <div>
          <ClipLoader
            color="blue"
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-white">
          El carrito está vacío <Link className="underline" href="/">Volver a la tienda!</Link>
        </div>
      ) : (
        <div className="w-full grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <table className="min-w-full bg-slate-100 rounded-lg">
              <thead className="border-b text-gray-900">
                <tr>
                  <th className="p-5 text-left">Producto</th>
                  <th className="p-5 text-right">Cantidad</th>
                  <th className="p-5 text-right">Precio</th>
                  <th className="p-5">Acción</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id} className="border-b text-gray-900">
                    <td>
                      <Link href={`/product/${item.id}`} className="flex items-center">
                        <Image
                          src={item.image}
                          alt={item.id}
                          width={50}
                          height={50}
                          className="p-1"
                        />
                        {item.name}
                      </Link>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-between items-center">
                        <button className="w-1/3 text-xs h-fit shadow-[0_0px_10px_0px_rgba(0,0,0,0.5)] rounded-sm" onClick={() => addToCartHandler(item, item.cart_item_id, item.qty - 1)} disabled={item.qty === 1}>
                          -
                        </button>
                        <span>{item.qty}</span>
                        <button className="w-1/3 text-xs h-fit shadow-[0_0px_10px_0px_rgba(0,0,0,0.5)] rounded-sm" onClick={() => addToCartHandler(item, item.cart_item_id, item.qty + 1)}>
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-5 text-right">${item.price}</td>
                    <td className="p-5 text-center">
                      <button className="w-full bg-red-500 rounded-lg text-white" onClick={() => removeFromCartHandler(item.id, item.cart_item_id)}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="w-full">
            <div className="card p-2 bg-slate-100 rounded-lg text-gray-900">
              <ul>
                <li>
                  <div className="pb-3 text-xl">
                    <p>Cantidad de productos: {cartItems.reduce((a, c) => a + c.qty, 0)}</p>
                    Total: ${itemsPrice}
                  </div>
                </li>
                <li>
                <div id="wallet_container">                    
                  <Wallet initialization={{ preferenceId: preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />
                </div>

                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
