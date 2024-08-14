'use client'

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

export default function App({children}: {children: React.ReactNode}) {
    const dispatch = useDispatch();
    const pathnames = usePathname();
    const [hovered, setHovered] = useState<string | null>(null);

    useEffect(() => {
        dispatch(hideLoading());
    }, [dispatch]);

    useEffect(() => {
        Aos.init();
    }, []);

    const { cartItems, loading } = useSelector((state: RootState) => state.cart);

    const handleHover = (text: string) => {
        setHovered(text);
    };

    const handleHoverEnd = () => {
        setHovered(null);
    };

    return (
        <div className="relative">
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
                {!['/signup', '/signin', '/banned', '/verified'].includes(pathnames) && (
                    <Navbar  />
                )}

                <div className="relative w-full mt-32 h-screen overflow-hidden">
                    <video src='/img/video.mp4' autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" />

                    <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-8">
                        <h1 
                            className="text-5xl font-serif tracking-wide transition-transform duration-500 transform hover:scale-110"
                            onMouseEnter={() => handleHover('Azul Lago')}
                            onMouseLeave={handleHoverEnd}
                            data-aos="zoom-in"
                        >
                            {hovered === 'Azul Lago' ? 'Bienvenido a' : 'Azul Lago'}
                        </h1>
                        <p 
                            className="text-3xl my-4 text-violet-200 transition-transform duration-500 transform hover:translate-x-2"
                            onMouseEnter={() => handleHover('Cooperativa')}
                            onMouseLeave={handleHoverEnd}
                            data-aos="fade-in-up"
                        >
                            {hovered === 'Cooperativa' ? 'Bienvenido a la' : 'Cooperativa de productores de Lago Puelo'}
                        </p>
                        <div className="flex flex-col items-center space-y-4 mt-6">
                            {['Tienda', 'Aceites esenciales', 'Hidrolatos', 'Fitocosmética'].map((item) => (
                                <p 
                                    key={item}
                                    className="text-2xl text-violet-300 transition-transform duration-500 transform hover:scale-105 hover:text-violet-100"
                                    onMouseEnter={() => handleHover(item)}
                                    onMouseLeave={handleHoverEnd}
                                    data-aos="fade-in-up"
                                >
                                    {hovered === item ? `Explora nuestros ${item.toLowerCase()}` : item}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                <Suspense
                    fallback={
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100vh",
                                marginTop: "10%"
                            }}
                        >
                            <ClipLoader
                                color="blue"
                                size={150}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </div>
                    }
                >
                    <main className="p-4 pt-40 mt-20 transition-all duration-300">{children}</main>
                </Suspense>
            </div>

            <CartSideBar
                // className="transition-transform transform-gpu ease-in-out duration-500"
                // style={{
                //     transform: cartItems.length > 0 ? "translateX(0)" : "translateX(100%)",
                // }}
            />
        </div>
    );
}
