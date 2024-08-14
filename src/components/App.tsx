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

    return (
        <>
            <div className={`relative ${loading ? '' : isCartVisiblePath ? 'lg:mr-32' : ''}`}>
                {!isExcludedPath && <Navbar />}

                <div className="relative w-full mb-10 mt-20 h-screen overflow-hidden">
                    <video src='/img/video.mp4' autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute flex flex-col justify-right items-rigth text-white p-0">
                        <h1
                            className="text-6xl lg:text-8xl mt-16 text-white font-Inter tracking-wide transition-transform duration-500 transform hover:scale-110 justify-start b 
                            shadow-lg bg-opacity-60 p-2 rounded-md"
                            onMouseEnter={() => handleHover('Azul Lago')}
                            onMouseLeave={handleHoverEnd}
                            data-aos="fade-left"
                        >
                            {hovered === 'Azul Lago' ? 'Cooperativa' : 'Azul Lago'}
                        </h1>
                        <p
                            className="text-xl lg:text-3xl my-4 text-center bg-opacity-40 rounded-3xl shadow-lg p-5 text-blue-500 bg-black bg-opacity-60"
                            onMouseEnter={() => handleHover('Productos orgánicos')}
                            onMouseLeave={handleHoverEnd}
                            data-aos="fade-in-up"
                        >
                            {hovered === 'Productos orgánicos' ? 'Tienda' : 'Productos orgánicos'}
                        </p>
                        <div className="flex flex-col items-center space-y-2 mt-2">
                            {['Cosmética', 'Medicinal', 'Aromática'].map((item) => (
                                <p
                                    key={item}
                                    className="text-lg lg:text-2xl p-2 text-blue-500 bg-white bg-opacity-90 transition-transform duration-500 transform hover:scale-105 hover:text-violet-900 border-blue-800 rounded-xl"
                                    onMouseEnter={() => handleHover(item)}
                                    onMouseLeave={handleHoverEnd}
                                    data-aos="fade-in-up"
                                >
                                    {hovered === item ? `${item}` : item}
                                </p>
                            ))}
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
                    <main className="p-12 pt-2 mt-20 transition-all duration-300">{children}</main>
                </Suspense>
            </div>

            <CartSideBar />
        </>
    );
}
