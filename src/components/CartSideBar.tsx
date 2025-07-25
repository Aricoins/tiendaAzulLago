import { useSelector } from "react-redux"
import { RootState, store } from "@/redux/store"
import Link from "next/link"
import Image from "next/image"
import { useDispatch } from "react-redux"
import { addToCart, removeFromCart } from "@/redux/slices/cartSlice"
import { usePathname } from 'next/navigation'
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs";
import { CartItem } from "@/app/lib/definitions";

interface Product extends CartItem {
  name: string;
}
  
  interface CartSideBarProps {
    stock: number;
  }

export default function CartSideBar(){
    const stock = 20
    const {loading, cartItems, itemsPrice} = useSelector((state: RootState) => state.cart)
    const dispatch = useDispatch()
    const [qtyItem, setQtyItem] = useState(0)
    
    const addToCartHandler = (product: Product, cart_item_id: number, qty: number) => {
      const updateQtyDB = async () => {
        try {
          let res = await fetch("/api/cart", {
            method: "PUT",
            body: JSON.stringify({ cart_item_id, qty }),
          });
          return console.log('qty udpaded to', qty)    
        } catch (error) {
          console.log('error', error)
        }       
    }
    updateQtyDB()
    dispatch(addToCart({...product, qty})) 
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

    const pathname = usePathname()
    
    return(
    <div
    className={
        loading
          ? ''
          : cartItems.length > 0 && (pathname === '/' || pathname === '/payment' || pathname === '/shipping' || pathname.indexOf('/product' ) >= 0)
          ? 'fixed top-20 right-0 w-3/8 zIndex-9000 bg-white h-8/8 shadow-lg text-blue-800 border-4 border-l-gray-400 overflow-y-scroll'
          : 'hidden'
      }
      >
            {loading ? 
                <div className="py-5 px-2 text-blue-500">Cargando...</div> 
                : cartItems.length === 0 ?
                <div className="py-5 m-auto px-2 text-blue-500">El carrito esta vacío</div>
                :
                <>
                <div className=" zIndex-1000 flex flex-col items-center text-black m-2 p-4 h-auto">
                    <div>Subtotal</div>
                    <div className="font-bold p-2 text-white-700">${itemsPrice}</div>
                    <div>
                        <Link
                            href='/cart'
                            className="w-full text-center p-2 m-1  bg-blue-500 text-white rounded-md">
                         Ver Carrito
                        </Link>
                    </div>
                    <div>
                        {cartItems.map((item) => (
                            <div key={item.cart_item_id}
                                className="p-2 flex flex-col items-center border-b border-b-gray-600">
                                    <Link href={`/product/${item.product_id}`}
                                    className="flex items-center">
                                        <Image 
                                        src={item.image} alt={item.product_id} 
                                        width={100}
                                        height={100}
                                        className="p-1 rounded-md"></Image>
                                    </Link>
                                    <div className="w-full flex items-center justify-evenly">
                                      <button
                                        className="w-1/5 text-sm text-blue-500 h-fit border border-white rounded-md"
                                        onClick={() => addToCartHandler(item, item.cart_item_id, item.qty - 1)}
                                        disabled={item.qty === 1}
                                      >
                                        -
                                      </button>
                                      <span className="text-blue-500">{item.qty}</span>
                                      <button
                                      className="w-1/5 text-sm h-fit border border-white rounded-md"
                                        onClick={() => addToCartHandler(item, item.cart_item_id, item.qty + 1)}
                                        disabled={item.qty === stock}
                                      >
                                        +
                                      </button>
                                    </div>
                                    <button className="default-button mt-2 bg-red-500 text-white rounded-md w-full"
                                    onClick={()=> removeFromCartHandler(item.product_id ,item.cart_item_id)}>
                                        Quitar
                                    </button>
                            </div>
                        ))}
                    </div>
                </div>
                </>
            }
        </div>
    )
}