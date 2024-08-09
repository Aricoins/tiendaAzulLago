"use client"
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { addToCart, removeFromCart } from "@/redux/slices/cartSlice";
import Link from "next/link";
import Image from "next/image";
import ClipLoader from "react-spinners/ClipLoader";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { useEffect, useState } from "react";
import axios from "axios"
import dotenv from "dotenv";

dotenv.config();

// Inicializa MercadoPago con la clave pública
initMercadoPago(process.env.NEXT_PUBLIC_MP_KEY || "key");

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
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, cartItems, itemsPrice } = useSelector(
    (state: RootState) => state.cart
  );
  const [preferenceId, setPreferenceId] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState(false);

  const addToCartHandler = (
    product: Product,
    cart_item_id: number,
    qty: number
  ) => {
    const updateQtyDB = async () => {
      try {
        await fetch("/api/cart", {
          method: "PUT",
          body: JSON.stringify({ product, cart_item_id, qty }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("qty updated to", qty);
      } catch (error) {
        console.error("error", error);
      }
    };
    updateQtyDB();
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id: string, cart_item_id: number) => {
    const removeFromCartDB = async () => {
      try {
        await fetch("/api/cart", {
          method: "DELETE",
          body: JSON.stringify({ cart_item_id }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("deleted", cart_item_id);
      } catch (error) {
        console.error("error", error);
      }
    };
    removeFromCartDB();
    dispatch(removeFromCart(id));
  };

  const createPreference = async () => {
    setIsLoading(true);
    try {
      console.log(cartItems, "cartitemsantesdemap");
      const items = cartItems.map((item) => ({
        id: item.id,
        title: item.name,
        currency_id: "ARS",
        description: "Descripción del Item",
        category_id: "art",
        quantity: item.qty,
        unit_price: Number(item.price),
      }));
      console.log(items, "antesdemap");

      const payer = {
        name: "Juan",
        surname: "Lopez",
        email: "user@email.com",
        phone: {
          area_code: "11",
          number: "4444-4444",
        },
        identification: {
          type: "DNI",
          number: "12345678",
        },
        address: {
          street_name: "Street",
          street_number: 123,
          zip_code: "5700",
        },
      };

      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          payer,
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
            failure: `${process.env.NEXT_PUBLIC_BASE_URL}/failure`,
            pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pending`,
          },
          auto_return: "approved",
          payment_methods: {
            excluded_payment_methods: [{ id: "master" }],
            excluded_payment_types: [{ id: "ticket" }],
            installments: 12,
          },
          notification_url: "https://www.azullago.com/",
          statement_descriptor: "MINEGOCIO",
          external_reference: "Reference_1234",
          expires: true,
          expiration_date_from: new Date().toISOString(),
          expiration_date_to: new Date(
            new Date().getTime() + 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
      });

      const data = await response.json();
      console.log(data, "data");
      const preferencia = data.preferenceId;
      console.log("Respuesta:", preferencia);
      console.log(process.env, "procecss")

      setPreferenceId(preferencia);
      console.log(preferenceId, "id de la preferencia en el estado lolcal");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  console.log(process.env, "process");

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
                      <Link
                        href={`/product/${item.id}`}
                        className="flex items-center"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                          className="p-1"
                        />
                        {item.name}
                      </Link>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-between items-center">
                        <button
                          className="w-1/3 text-xs h-fit shadow-[0_0px_10px_0px_rgba(0,0,0,0.5)] rounded-sm"
                          onClick={() =>
                            addToCartHandler(
                              item,
                              item.cart_item_id,
                              item.qty - 1
                            )
                          }
                          disabled={item.qty === 1}
                        >
                          -
                        </button>
                        <span>{item.qty}</span>
                        <button
                          className="w-1/3 text-xs h-fit shadow-[0_0px_10px_0px_rgba(0,0,0,0.5)] rounded-sm"
                          onClick={() =>
                            addToCartHandler(
                              item,
                              item.cart_item_id,
                              item.qty + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-5 text-right">${item.price}</td>
                    <td className="p-5 text-center">
                      <button
                        className="w-full bg-red-500 rounded-lg text-white"
                        onClick={() =>
                          removeFromCartHandler(item.id, item.cart_item_id)
                        }
                      >
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
                    <p>
                      Cantidad de productos:{" "}
                      {cartItems.reduce((a, c) => a + c.qty, 0)}
                    </p>
                    Total: ${itemsPrice}
                  </div>
                </li>

                <li>
                  <button
                    className="w-full bg-blue-500 text-white rounded-lg"
                    onClick={createPreference}
                    disabled={isLoading}
                  >
                    {isLoading ? "Creando Preferencia..." : "Pagar"}
                  </button>
                </li>
                <li>
                  {preferenceId && (
                    <div id="wallet_container">
                      <Wallet initialization={{ preferenceId }} />
                    </div>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
