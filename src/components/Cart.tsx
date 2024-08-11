'use client'
import Link from "next/link";
import { useSelector } from "react-redux"
import { RootState, store } from "@/redux/store"
import { MdOutlineShoppingCart } from "react-icons/md";

export default function Cart (){
    const {loading, cartItems, itemsPrice} = useSelector((state: RootState) => state.cart)
    const totalQuantity = cartItems.reduce((acc, item) => acc + item.qty, 0);
    return(
        <div>
            {totalQuantity > 0 && <span className='cart-badge'>
                {loading ? '' : cartItems.reduce((a, c) => a+ c.qty, 0)}
            </span>}
            <Link href='/cart'>
            <MdOutlineShoppingCart style={{color: "blue", fontSize: "35px", margin: "20px", justifyItems: "rigth" }} /> 
            </Link>
        </div>
    )
}
