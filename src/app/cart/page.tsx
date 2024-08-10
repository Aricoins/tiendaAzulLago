"use client";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { addToCart, removeFromCart } from "@/redux/slices/cartSlice";
import Link from "next/link";
import Image from "next/image";
import ClipLoader from "react-spinners/ClipLoader";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { useEffect, useState } from "react";
<<<<<<< HEAD
import { Modal, Form, Input, Button } from "antd";
=======
import axios from "axios"
>>>>>>> 33eade32a5ab78b7af9fa340370ade2c6dad84a7
import dotenv from "dotenv";
import { useUser } from "@clerk/clerk-react";
import { MdOutlineShoppingCart } from "react-icons/md";


dotenv.config();

initMercadoPago(process.env.NEXT_PUBLIC_MP_KEY || "key",  { locale: 'es-AR' });

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const user = useUser();

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
      } catch (error) {
        console.error("error", error);
      }
    };
    removeFromCartDB();
    dispatch(removeFromCart(id));
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values: number) => {
        form.resetFields();
        setIsModalOpen(false);
        createPreference(values);
      })
      .catch((info: string) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };



  const createPreference = async (payerDetails: any) => {
    setIsLoading(true);
    try {
      const items = cartItems.map((item) => ({
        id: item.id,
        title: item.name,
        currency_id: "ARS",
        description: item.name,
        quantity: item.qty,
        unit_price: Number(item.price),
      }));

      const payer = {
        name: user.user?.firstName,
        surname: user.user?.lastName,
        email: user.user?.primaryEmailAddress?.emailAddress,
        identification: {
          type: "DNI",
          number: payerDetails.identification,
        },
        phone: {
          area_code: payerDetails.phone_area_code,
          number: payerDetails.phone_number,
        },
        address: {
          street_name: payerDetails.address,
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
          statement_descriptor: "Azul Lago Tienda",
          external_reference: "Pruebas",
          expires: true,
          expiration_date_from: new Date().toISOString(),
          expiration_date_to: new Date(
            new Date().getTime() + 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
      });

      const data = await response.json();
      setPreferenceId(data.preferenceId);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };


    return (
      <div className="flex flex-col w-full m-20 p-20 justify-center ">
         <div className="mb-4 flex flex-row gap-4 text-xl text-white">
         <div>  <MdOutlineShoppingCart className="text-3xl"/> </div> <h3> Mi carrito </h3>
          </div>
        {loading ? (
          <ClipLoader
            color="blue"
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        ) : (
          <div className="w-3/3 flex flex-col items-center md:grid md:grid-cols-4 md:gap-5">
            <div className="overflow-x-auto md:col-span-3">
              <table className="w-full bg-blue-600 rounded-lg ">
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
                    <tr key={item.id} className="border-b text-white">
                      <td>
                        <Link
                          href={`/product/${item.id}`}
                          className="flex items-center text-white"
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
                      <td className="p-5 text-right text-white">
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
                          className="w-full bg-violet-900 rounded-lg text-white"
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
    
              <div className="w-full">
                <div className="card p-2 bg-slate-100 rounded-lg text-gray-900">
                  <ul>
                    <li>
                      <div className="pb-3 text-xl bg-green-500 m-4 text-center text-white p-4">
                        <p>
                          Cantidad de productos:{" "}
                          {cartItems.reduce((a, c) => a + c.qty, 0)}
                        </p>
                        Total: ${itemsPrice}
                      </div>
                    </li>
                    <li className="flex justify-center ">
                      <Button
                        type="primary"
                        onClick={() => setIsModalOpen(true)}
                        disabled={isLoading}
                        className="bg-blue-500 text-black text-lg text-center"
                      >
                        {isLoading ? "Generando pago..." : "Cargar datos de envío"}
                      </Button>
                    </li>
                    <li>
                      {preferenceId && (
                        <Wallet
                          initialization={{ preferenceId }}
                        
                        />
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
    
      <Modal
        title="Datos de Envío"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Confirmar"
        cancelText="Cancelar"
        okButtonProps={{
          style: {
            backgroundColor: "#006eff", // Cambia el color de fondo
            borderColor: "#000000",      // Cambia el color del borde
            color: "#000000",               // Cambia el color del texto
            fontWeight: "bold",          // Hacer el texto más grueso
          },
        }}
        cancelButtonProps={{
          style: {
            color: "#000002",            // Cambia el color del texto del botón de cancelar
          },
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="identification"
            label="Identificación"
            rules={[
              {
                required: true,
                message: "Ingresá tu DNI",
              },
            ]}
          >
            <Input placeholder="DNI" />
          </Form.Item>

          <Form.Item
            name="phone_area_code"
            label="Código de Área"
            rules={[
              {
                required: true,
                message: "Ingresá el código de área",
              },
            ]}
          >
            <Input placeholder="Código de Área" />
          </Form.Item>
          <Form.Item
            name="phone_number"
            label="Número de Teléfono"
            rules={[
              {
                required: true,
                message: "Ingresá tu número de teléfono",
              },
            ]}
          >
            <Input placeholder="Número de Teléfono" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Dirección"
            rules={[
              { required: true, message: "Ingresá la dirección de envío." },
            ]}
          >
            <Input placeholder="Dirección" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
