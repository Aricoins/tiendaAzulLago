'use client'

import { Suspense, useEffect } from "react"
import CartSideBar from "./CartSideBar"
import Navbar from "./layout/NavBar"
import { useDispatch, useSelector } from "react-redux"
import { hideLoading } from "@/redux/slices/cartSlice"
import { usePathname } from 'next/navigation'
import { RootState } from "@/redux/store"
import ClipLoader from "react-spinners/ClipLoader";





export default function App({children,
}: {
  children: React.ReactNode}) {
    const dispatch = useDispatch()
    const pathnames = usePathname();


    useEffect(()=>{
        dispatch(hideLoading())
    },[dispatch])

    const { cartItems, loading } = useSelector((state: RootState) => state.cart)

    return(
        <div>
            <div
        className={`${
          loading
            ? ''
            : cartItems.length > 0 &&
            (pathnames === '/' || pathnames === '/payment' || pathnames === '/shipping' || pathnames.indexOf('/product' ) >= 0)
            ? 'mr-32'
            : ''
        }`}
      >
                {['/signup', '/signin', '/banned', '/verified'].includes(pathnames) ? null : <Navbar />}
                <Suspense fallback={<div
    style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}
    >  <ClipLoader
    color="blue"

    size={150}


    aria-label="Loading Spinner"
    data-testid="loader"
  /></div>}>
                <main className="p-4">{children}</main>
                </Suspense>
            </div>
            <CartSideBar/>
        </div>
    )
}