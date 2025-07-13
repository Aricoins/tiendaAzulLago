'use client';

import { Suspense, useEffect, useState } from "react";
import CartSideBar from "./CartSideBar";
import Navbar from "./layout/NavBar";
import { useDispatch, useSelector } from "react-redux";
import { hideLoading } from "@/redux/slices/cartSlice";
import { usePathname } from 'next/navigation';
import { RootState } from "@/redux/store";
import ClipLoader from "react-spinners/ClipLoader";
import Aos from 'aos';
import 'aos/dist/aos.css';
import Image from "next/image";
import Foot from "@/components/Foot";

export default function App({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const pathname = usePathname();
    const [hovered, setHovered] = useState<string | null>(null);

    useEffect(() => {
        dispatch(hideLoading());
    }, [dispatch]);

    useEffect(() => {
        Aos.init();
    }, []);

    const { cartItems, loading } = useSelector((state: RootState) => state.cart);

    const handleHover = (text: string) => setHovered(text);
    const handleHoverEnd = () => setHovered(null);

    const isExcludedPath = ['/signup', '/signin', '/banned', '/verified'].includes(pathname);
    const isCartVisiblePath = cartItems.length > 0 && ['/', '/payment', '/shipping'].includes(pathname) || pathname.includes('/product');
    const isHomePage = pathname === '/'; // Check if the current page is the home page

    return (
        <>
            <div className={`relative ${loading ? '' : isCartVisiblePath ? 'lg:mx-0' : ''}`}>
                {!isExcludedPath && <Navbar />}
                <div className="relative w-full mt-2 h-screen overflow-hidden">
                    <video src='/img/video.mp4' autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" style={{ maskImage: "linear-gradient(to bottom, #d6c2c2 80%, transparent 100%)"}} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-0">
                        <div className="text-center w-full flex flex-col items-center justify-center">
                            <div className="logo-container">
                                <svg viewBox="0 0 600 200" className="curved-text-svg">
                                    <defs>
                                        <path id="arc" d="M 50 150 Q 300 50 550 150" stroke="transparent" fill="none"/>
                                    </defs>
                                    <text
                                        className="logo-azul-lago-hero-svg"
                                        onMouseEnter={() => handleHover('Azul Lago')}
                                        onMouseLeave={handleHoverEnd}
                                        data-aos="fade-left"
                                    >
                                        <textPath href="#arc" startOffset="50%" textAnchor="middle">
                                            AZUL LAGO
                                        </textPath>
                                    </text>
                                </svg>
                            </div>
                            <p className="logo-coop-text" data-aos="fade-right">
                                COOP
                            </p>
                        </div>
                        <p
                            className="text-xl lg:text-3xl my-4 text-center rounded-3xl shadow-lg p-5 bg-black bg-opacity-60 transition-all duration-700 ease-out hover:text-green-500 cursor-pointer"
                            onMouseEnter={() => handleHover('Tienda Online')}
                            onMouseLeave={handleHoverEnd}
                            data-aos="fade-in-up"
                            onClick={(e) => {
                                e.preventDefault(); 
                                window.location.href = "/"; // Redirigir a la página de inicio
                            }}
                        >
                            {hovered === 'Tienda Online' ? 'Productos orgánicos de la Patagonia' : 'Tienda Online'}
                        </p>

                        <div 
                            className="flex flex-row justify-center items-center mt-20 gap-8 bg-white bg-opacity-60 w-full text-black transition-transform duration-700 ease-out hover:scale-105"
                            data-aos="fade-up"
                        >
                            <p className="hover:text-gray-800 hover:font-bold transition-colors duration-500 text-md ">
                                Productos elaborados en Lago Puelo, Argentina | Envios a todo el Pais 🚛 ✈️
                            </p>
                        </div>
                    </div>
                </div>

                <Suspense
                    fallback={
                        <div className="flex justify-center items-center h-screen mt-0">
                            <ClipLoader color="blue" size={150} aria-label="Loading Spinner" data-testid="loader" />
                        </div>
                    }
                >
                    <main className="p-12 pt-2 mt-20 transition-all duration-300 bg-black bg-opacity-10">{children}</main>
                </Suspense>
            </div>

            <CartSideBar />

            <Foot />
        </>
    );
}
