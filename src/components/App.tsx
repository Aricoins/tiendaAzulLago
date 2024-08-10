'use client'

import { Suspense, useEffect } from "react"
import CartSideBar from "./CartSideBar"
import Navbar from "./layout/NavBar"
import { useDispatch, useSelector } from "react-redux"
import { hideLoading } from "@/redux/slices/cartSlice"
import { usePathname } from 'next/navigation'
import { RootState } from "@/redux/store"
import ClipLoader from "react-spinners/ClipLoader";
import Image from "next/image"
import imagen from  './azul.webp'
import Aos from 'aos'
import 'aos/dist/aos.css';

export default function App({children}: {children: React.ReactNode}) {
    const dispatch = useDispatch()
    const pathnames = usePathname();

    useEffect(() => {

        dispatch(hideLoading())
    }, [dispatch])

    
    useEffect(() => {
 Aos.init()
    }, [])
    const { cartItems, loading } = useSelector((state: RootState) => state.cart)

    return (
        <div>
          <div
                className={`${
                    loading
                        ? ''
                        : cartItems.length > 0 &&
                        (pathnames === '/' || pathnames === '/payment' || pathnames === '/shipping' || pathnames.indexOf('/product') >= 0)
                        ? 'mr-32'
                        : ''
                }`}
            >
                {['/signup', '/signin', '/banned', '/verified'].includes(pathnames) ? null : <Navbar />}
              
<div className="relative w-full ">
  <Image 
    src={imagen}
    width={1400}
    height={1400}
    className="w-full"
    alt="lagoIA"
  />
  <div  data-aos="zoom-in" className="absolute top-20 left-20 text-white bg-black  bg-opacity-25 p-8 text-sm lg:text-7xl z-10 text-center">
    Bienvenidos a Tienda Azul Lago  
    <p data-aos="zoom-in" className="text-2xl my-8 text-violet-900">Cosmética, medicinal y aromática natural </p>
  </div>
</div>
    
                <Suspense fallback={
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                        <ClipLoader color="blue" size={150} aria-label="Loading Spinner" data-testid="loader" />
                    </div>
                }>
                    <main className="p-4">{children}</main>
                </Suspense>
            </div>
       
            <CartSideBar />



        </div>
    )
}
